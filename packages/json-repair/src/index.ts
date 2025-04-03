export interface RepairOptions {
  safeMode?: boolean;      // If true => limits "heavy" repairs (see code) and throws "Unable to repair invalid JSON." if still invalid
  extractJson?: boolean;   // Attempts to extract the first valid JSON block
  encodeAscii?: boolean;   // Converts all non-ASCII characters to \uXXXX notation
  returnObject?: boolean;  // If true, returns a JS object instead of a JSON string (default: false)
  logging?: boolean;       // Log each transformation step
}

/**
 * Attempts to extract a valid JSON block (between braces or brackets) from a string
 */
export function extractJsonFromText(input: string): string {
  let cleaned = input.trim()
    .replace(/^```json\s*/i, '')
    .replace(/```$/, '')
    .trim();

  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');

  // We look for the first "{" or "[" to guess the beginning of the JSON
  const start = firstBrace >= 0 && (firstBrace < firstBracket || firstBracket === -1)
    ? firstBrace
    : firstBracket;

  // If not found, we return the input as is
  if (start === -1) return input;

  // We traverse the string from "start" until the braces/brackets are balanced
  const stack: string[] = [];
  let end = start;
  for (let i = start; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (char === '{' || char === '[') {
      stack.push(char);
    } else if (char === '}' || char === ']') {
      const last = stack.pop();
      if (!last || (char === '}' && last !== '{') || (char === ']' && last !== '[')) {
        // Imbalance, we stop
        break;
      }
      // If the stack is empty, we've closed everything, we can stop
      if (stack.length === 0) {
        end = i + 1;
        break;
      }
    }
  }

  return cleaned.substring(start, end);
}

/**
 * Repairs any broken string fragments
 * (simple case: {foo: bar} on a single line).
 */
function fixBrokenStringValues(json: string): string {
  return json
    .split('\n')
    .map((line) => {
      const start = line.indexOf('{');
      const end = line.lastIndexOf('}');
      if (start === -1 || end === -1 || start >= end || line.includes(',')) return line;

      const content = line.slice(start + 1, end);
      const colon = content.indexOf(':');
      if (colon === -1) return line;

      const key = content.slice(0, colon).trim();
      let value = content.slice(colon + 1).trim();

      if (value.includes('"')) {
        if (!value.startsWith('"')) value = '"' + value;
        if (!value.endsWith('"')) value = value + '"';
        // We escape unprotected inner quotes
        value = value.slice(1, -1).replace(/(?<!\\)"/g, '\\"');
        value = '"' + value + '"';
      }

      return `{${key}: ${value}}`;
    })
    .join('\n');
}

/**
 * Escapes unprotected quotes inside values already between quotes.
 */
function escapeInnerQuotesInStrings(json: string): string {
  return json.replace(/"([^"\n\\]*?)"/g, (match, content) => {
    // We only modify if we find unescaped quotes
    if (/[^\\]"/.test(content)) {
      const safe = content.replace(/([^\\])"/g, '$1\\"');
      return `"${safe}"`;
    }
    return match;
  });
}

/**
 * Naive balancing of braces and brackets:
 * - Removes "excess" closing brackets if there was no corresponding opening bracket.
 * - Adds missing closing brackets at the end of the string if necessary.
 */
function balanceJsonBrackets(input: string): string {
  let curlyCount = 0;   // counting for { }
  let squareCount = 0;  // counting for [ ]
  const chars = [...input];

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === '{') {
      curlyCount++;
    } else if (c === '}') {
      // We have a '}' when there's no '{' open => we remove it
      if (curlyCount > 0) curlyCount--;
      else chars[i] = '';
    } else if (c === '[') {
      squareCount++;
    } else if (c === ']') {
      // Same principle for brackets
      if (squareCount > 0) squareCount--;
      else chars[i] = '';
    }
  }

  // Add missing closing brackets if openCount > 0
  let result = chars.join('');
  if (curlyCount > 0) {
    result += '}'.repeat(curlyCount);
  }
  if (squareCount > 0) {
    result += ']'.repeat(squareCount);
  }
  return result;
}

/**
 * Replaces (in values between quotes) real \n, \r, \t
 * with their escaped versions \\n, \\r, \\t.
 *
 * This approach is naive: if someone had already written \n, it becomes \\n.
 * But for your specific test (and most cases), it's sufficient.
 */
function escapeControlCharsInsideStrings(json: string): string {
  let inString = false;
  let escaped = false;
  const chars = [...json];

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];

    // Detects quotes that open/close a string
    if (c === '"' && !escaped) {
      inString = !inString;
      escaped = false;
    } else if (c === '\\' && !escaped) {
      // Backslash => the next character is escaped
      escaped = true;
    } else {
      if (inString) {
        // If we're inside a string, we replace real \n, \r, \t
        if (c === '\n') {
          chars[i] = '\\n';
        } else if (c === '\r') {
          chars[i] = '\\r';
        } else if (c === '\t') {
          chars[i] = '\\t';
        }
      }
      escaped = false;
    }
  }

  return chars.join('');
}

/**
 * Repairs a potentially incorrect JSON string by applying various
 * transformations (extraction, removal of trailing commas, quoting, etc.).
 * Returns either a JSON string (default) or a JS object (if `returnObject` is true).
 */
export function repairJson(input: string, options: RepairOptions = {}): unknown {
  try {
    // First, we test if it's already parseable as is
    const parsed = JSON.parse(input);
    if (!options.returnObject) {
      let json = JSON.stringify(parsed);
      if (options.encodeAscii) {
        json = json.replace(/[^\x00-\x7F]/g, (c) =>
          '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')
        );
      }
      return json;
    }
    return parsed;
  } catch (e) {
    if (options.logging) {
      console.warn('JSON.parse failed:', e);
      console.warn('Trying to repair JSON...');
    }

    let fixed = input;

    // 1. Optional extraction
    if (options.extractJson) {
      fixed = extractJsonFromText(fixed);
      if (options.logging) console.log('Extracted JSON block:', fixed);
    }

    // 2. Removal of comments
    fixed = fixed.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');
    if (options.logging) console.log('Removed comments:', fixed);

    // 3. Removal of trailing commas
    fixed = fixed.replace(/,\s*([\]}])/g, '$1');
    if (options.logging) console.log('Removed trailing commas:', fixed);

    // 4. Adding quotes around unquoted keys
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');
    if (options.logging) console.log('Quoted keys:', fixed);

    // 5. Conversion of single quotes to double quotes
    fixed = fixed.replace(/'([^']*)'/g, '"$1"');
    if (options.logging) console.log('Converted single to double quotes:', fixed);

    // 6. Replacement of invalid literals (NaN, undefined, Infinity, -Infinity)
    fixed = fixed.replace(/\b(NaN|undefined|Infinity|-Infinity)\b/g, 'null');
    if (options.logging) console.log('Replaced invalid literals:', fixed);

    // 6bis. Replacement of capitalized versions
    fixed = fixed.replace(/\bTrue\b/g, 'true')
    .replace(/\bTRUE\b/g, 'true')
    .replace(/\bFalse\b/g, 'false') // or just /false\b/i if you want to handle everything
    .replace(/\bFALSE\b/g, 'false') // or just /false\b/i if you want to handle everything
    .replace(/\bNull\b/g, 'null')
    .replace(/\bNULL\b/g, 'null');
    if (options.logging) console.log('Replaced capitalized True/False/Null:', fixed);

    // 7. Quoting unquoted values (except true/false/null)
    fixed = fixed.replace(/:\s*(?!true\b|false\b|null\b)([a-zA-Z_][a-zA-Z0-9_]*)([\}\],])/g, ': "$1"$2');
    if (options.logging) console.log('Quoted unquoted string values:', fixed);

    // 7bis. Fix the case where we have : John", i.e. an unquoted word followed by a quote
    fixed = fixed.replace(/:\s*([a-zA-Z0-9_]+)"([\}\],])/g, ': "$1"$2');
    if (options.logging) console.log('Fixed missing opening quote for values:', fixed);

    // 8. Fix any lines like {foo: bar}
    fixed = fixBrokenStringValues(fixed);
    if (options.logging) console.log('Fixed broken string values:', fixed);

    // 9. Escape unprotected quotes in strings
    fixed = escapeInnerQuotesInStrings(fixed);
    if (options.logging) console.log('Escaped inner unquoted double quotes:', fixed);

    // 10. Balancing of braces/brackets (if we consider that in safeMode we don't want to "overcorrect" too much, we can condition it)
    if (!options.safeMode) {
      fixed = balanceJsonBrackets(fixed);
      if (options.logging) console.log('Balanced brackets:', fixed);
    }

    // 11. Escape real line breaks, tabs, etc. in strings
    fixed = escapeControlCharsInsideStrings(fixed);
    if (options.logging) console.log('Escaped control chars:', fixed);

    // Last attempt
    try {
      const repaired = JSON.parse(fixed);
    
      if (!options.returnObject) {
        let json = JSON.stringify(repaired);
        if (options.encodeAscii) {
          json = json.replace(/[^\x00-\x7F]/g, (c) =>
            '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')
          );
        }
        return json;
      }
    
      return repaired;
    } catch (err: any) {
      if (options.logging) {
        console.warn('[json-repair] Repair failed:', err);
      }
    
      const preview = input.slice(0, 100).replace(/\n/g, ' ').trim(); // short preview
    
      const baseMessage = `[json-repair] Failed to parse repaired JSON.`;
      const details = err instanceof Error ? err.message : 'Unknown parsing error';
      const combined = `${baseMessage} ${details} Input was: "${preview}..."`;
    
      if (options.safeMode) {
        throw new Error(baseMessage);
      } else {
        throw new Error(combined);
      }
    }
  }
}
