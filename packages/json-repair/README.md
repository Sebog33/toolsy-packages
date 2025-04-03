# @toolsycc/json-repair

> A small but powerful utility to repair broken JSON strings — especially useful when dealing with LLM output or hand-written JSON.  
> Need to repair JSON? This tool automatically fixes malformed or broken JSON structures with a single function call.
> ✅ Works seamlessly with both **TypeScript** and **JavaScript** (ESM & CommonJS).

## Features

- Fixes:
  - Unquoted keys
  - Unquoted string values
  - Trailing commas
  - Invalid literals (NaN, undefined, Infinity)
  - Capitalized literals (True, False, Null)
  - Single quotes
  - Missing closing braces
  - Misplaced quotes inside strings
  - LLM code blocks (e.g. ```json ... ```)
  - LLM JSON extraction (e.g. `The result is: {...}`)
- Option to return a string or JS object
- ASCII escaping (e.g. `Café` → `Caf\u00e9`)
- Safe fallback mode

## Install

```bash
pnpm add @toolsycc/json-repair
```

Or with npm:

```bash
npm install @toolsycc/json-repair
```

## Example usage

### 🟦 TypeScript
```ts
import { repairJson } from '@toolsycc/json-repair';

const input = `{name: Seb, age: 42,}`;
const repaired = repairJson(input);
console.log(repaired);
// → {"name":"Seb","age":42}
```

### 🟨 JavaScript (CommonJS)
```js
const { repairJson } = require('@toolsycc/json-repair');

console.log(repairJson('{name: Seb, age: 42,}'));
```

### 🟩 JavaScript (ESM)
```js
import { repairJson } from '@toolsycc/json-repair';

console.log(repairJson('{name: Seb, age: 42,}'));
```

## Options

| Option         | Type     | Default | Description |
|----------------|----------|---------|-------------|
| `extractJson`  | boolean  | `false` | Extracts the first JSON block from surrounding text (useful for LLM output) |
| `encodeAscii`  | boolean  | `false` | Escapes non-ASCII characters (`é` → `\u00e9`) |
| `returnObject` | boolean  | `false` | If true, returns a JS object instead of a JSON string |
| `logging`      | boolean  | `false` | Enables console logs of each transformation step |
| `safeMode`     | boolean  | `false` | If true, throws a friendly error instead of crashing on unrecoverable input |

## Examples

| Input                               | Output                                  |
|------------------------------------|------------------------------------------|
| `{name: Seb}`                      | `{"name":"Seb"}`                        |
| `{user: {name: Seb, age: 30}}`     | `{"user":{"name":"Seb","age":30}}`      |
| `{value: NaN}`                     | `{"value":null}`                        |
| `'{"text": "Café"}'` + `encodeAscii: true` | `{"text":"Caf\u00e9"}`           |
| `Hello!\n\n\\`\\`\\`json\n{name: Seb}`   | `{"name":"Seb"}`                        |

## Live demonstration

Try it: [Toolsy](https://www.toolsy.cc/tools/json/analyze)

## Motivation

This package was designed to help deal with **malformed JSON**, especially the kind you get from LLMs like ChatGPT and OpenAI APIs when asking for `json` output.
This package is ideal if you're looking to **repair JSON**, **fix malformed JSON**, or **sanitize AI-generated output**.
It can also be used to quickly recover and parse broken logs or hand-crafted config files.

## Author

Made by [@Sebog33](https://github.com/Sebog33)  
Follow [Toolsy](https://www.toolsy.cc) for more tiny dev-focused utilities.

## License

MIT
