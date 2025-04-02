export interface RepairOptions {
  safeMode?: boolean;      // Si true => on limite les réparations "lourdes" (voir le code) et on lève "Unable to repair invalid JSON." si c'est encore invalide
  extractJson?: boolean;   // Tente d'extraire le premier bloc JSON valide
  encodeAscii?: boolean;   // Convertit tous les caractères non-ASCII en notation \uXXXX
  returnObject?: boolean;  // Si true, renvoie un objet JS au lieu d'une string JSON (par défaut : false)
  logging?: boolean;       // Log chaque étape de transformation
}

/**
 * Tente d'extraire un bloc JSON valide (entre accolades ou crochets) dans une chaîne
 */
export function extractJsonFromText(input: string): string {
  let cleaned = input.trim()
    .replace(/^```json\s*/i, '')
    .replace(/```$/, '')
    .trim();

  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');

  // On cherche le premier "{" ou "[" pour deviner le début du JSON
  const start = firstBrace >= 0 && (firstBrace < firstBracket || firstBracket === -1)
    ? firstBrace
    : firstBracket;

  // Si pas trouvé, on renvoie le input tel quel
  if (start === -1) return input;

  // On parcourt la chaîne depuis "start" jusqu'à ce que les accolades/crochets soient équilibrés
  const stack: string[] = [];
  let end = start;
  for (let i = start; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (char === '{' || char === '[') {
      stack.push(char);
    } else if (char === '}' || char === ']') {
      const last = stack.pop();
      if (!last || (char === '}' && last !== '{') || (char === ']' && last !== '[')) {
        // Déséquilibre, on arrête
        break;
      }
      // Si la pile est vide, on a refermé tout, on peut s'arrêter
      if (stack.length === 0) {
        end = i + 1;
        break;
      }
    }
  }

  return cleaned.substring(start, end);
}

/**
 * Répare les éventuels petits bouts de chaînes brisés
 * (cas simpliste : {foo: bar} sur une seule ligne).
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
        // On échappe les guillemets internes non protégés
        value = value.slice(1, -1).replace(/(?<!\\)"/g, '\\"');
        value = '"' + value + '"';
      }

      return `{${key}: ${value}}`;
    })
    .join('\n');
}

/**
 * Échappe les guillemets non protégés à l’intérieur des valeurs déjà entre guillemets.
 */
function escapeInnerQuotesInStrings(json: string): string {
  return json.replace(/"([^"\n\\]*?)"/g, (match, content) => {
    // On ne modifie que si on trouve des guillemets non échappés
    if (/[^\\]"/.test(content)) {
      const safe = content.replace(/([^\\])"/g, '$1\\"');
      return `"${safe}"`;
    }
    return match;
  });
}

/**
 * Équilibrage naïf des accolades et crochets :
 * - Retire les fermants "en trop" s'il n'y avait pas d'ouvrant correspondant.
 * - Ajoute les fermants manquants en fin de chaîne si nécessaire.
 */
function balanceJsonBrackets(input: string): string {
  let curlyCount = 0;   // comptage pour { }
  let squareCount = 0;  // comptage pour [ ]
  const chars = [...input];

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === '{') {
      curlyCount++;
    } else if (c === '}') {
      // On a un '}' alors qu'il n'y a pas de '{' ouvert => on retire
      if (curlyCount > 0) curlyCount--;
      else chars[i] = '';
    } else if (c === '[') {
      squareCount++;
    } else if (c === ']') {
      // Même principe pour les crochets
      if (squareCount > 0) squareCount--;
      else chars[i] = '';
    }
  }

  // Ajoute les fermants manquants si openCount > 0
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
 * Remplace (dans les valeurs entre guillemets) les vrais \n, \r, \t
 * par leurs versions échappées \\n, \\r, \\t.
 *
 * Cette approche est naïve : si quelqu’un avait déjà écrit \n, cela devient \\n.
 * Mais pour ton test spécifique (et la majorité des cas), ça suffit.
 */
function escapeControlCharsInsideStrings(json: string): string {
  let inString = false;
  let escaped = false;
  const chars = [...json];

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];

    // Détecte les guillemets qui ouvrent/ferment une chaîne
    if (c === '"' && !escaped) {
      inString = !inString;
      escaped = false;
    } else if (c === '\\' && !escaped) {
      // Backslash => le prochain caractère est échappé
      escaped = true;
    } else {
      if (inString) {
        // Si on est à l'intérieur d'une chaîne, on remplace les vrais \n, \r, \t
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
 * Répare une chaîne JSON potentiellement incorrecte en appliquant diverses
 * transformations (extraction, retrait des trailing commas, quoting, etc.).
 * Retourne soit un string JSON (par défaut) soit un objet JS (si `returnObject` est à true).
 */
export function repairJson(input: string, options: RepairOptions = {}): unknown {
  try {
    // D'abord, on teste si c'est déjà parseable tel quel
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

    // 1. Extraction optionnelle
    if (options.extractJson) {
      fixed = extractJsonFromText(fixed);
      if (options.logging) console.log('Extracted JSON block:', fixed);
    }

    // 2. Retrait des commentaires
    fixed = fixed.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');
    if (options.logging) console.log('Removed comments:', fixed);

    // 3. Retrait des trailing commas
    fixed = fixed.replace(/,\s*([\]}])/g, '$1');
    if (options.logging) console.log('Removed trailing commas:', fixed);

    // 4. Ajout de guillemets autour des clés non guillémées
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');
    if (options.logging) console.log('Quoted keys:', fixed);

    // 5. Conversion des quotes simples en doubles
    fixed = fixed.replace(/'([^']*)'/g, '"$1"');
    if (options.logging) console.log('Converted single to double quotes:', fixed);

    // 6. Remplacement des littéraux invalides (NaN, undefined, Infinity, -Infinity)
    fixed = fixed.replace(/\b(NaN|undefined|Infinity|-Infinity)\b/g, 'null');
    if (options.logging) console.log('Replaced invalid literals:', fixed);

    // 6bis. Remplacement des versions capitalisées
    fixed = fixed.replace(/\bTrue\b/g, 'true')
    .replace(/\bTRUE\b/g, 'true')
    .replace(/\bFalse\b/g, 'false') // voire juste /false\b/i si tu veux tout gérer
    .replace(/\bFALSE\b/g, 'false') // voire juste /false\b/i si tu veux tout gérer
    .replace(/\bNull\b/g, 'null')
    .replace(/\bNULL\b/g, 'null');
    if (options.logging) console.log('Replaced capitalized True/False/Null:', fixed);

    // 7. Quoter les valeurs non guillémées (hors true/false/null)
    fixed = fixed.replace(/:\s*(?!true\b|false\b|null\b)([a-zA-Z_][a-zA-Z0-9_]*)([\}\],])/g, ': "$1"$2');
    if (options.logging) console.log('Quoted unquoted string values:', fixed);

    // 8. Réparer les éventuelles lignes type {foo: bar}
    fixed = fixBrokenStringValues(fixed);
    if (options.logging) console.log('Fixed broken string values:', fixed);

    // 9. Échapper les guillemets non protégés dans les strings
    fixed = escapeInnerQuotesInStrings(fixed);
    if (options.logging) console.log('Escaped inner unquoted double quotes:', fixed);

    // 10. Équilibrage des accolades/crochets (si on considère qu'en safeMode on veut pas trop "surcorriger", on peut conditionner)
    if (!options.safeMode) {
      fixed = balanceJsonBrackets(fixed);
      if (options.logging) console.log('Balanced brackets:', fixed);
    }

    // 11. Échapper les vrais retours ligne, tab, etc. dans les strings
    fixed = escapeControlCharsInsideStrings(fixed);
    if (options.logging) console.log('Escaped control chars:', fixed);

    // Dernière tentative
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
    } catch (finalError) {
      if (options.logging) {
        console.warn('Repair failed:', finalError);
      }
      if (options.safeMode) {
        throw new Error('Unable to repair invalid JSON.');
      }
      throw finalError;
    }
  }
}
