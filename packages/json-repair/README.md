# @toolsy/json-repair

> 🛠️ A small but powerful utility to repair broken JSON strings — especially useful when dealing with LLM output or hand-written JSON.

---

## ✨ Features

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
- Option to return a string or JS object
- ASCII escaping (e.g. `Café` → `Caf\u00e9`)
- Safe fallback mode

---

## 🚀 Install

```bash
pnpm add @toolsy/json-repair
```

Or with npm:

```bash
npm install @toolsy/json-repair
```

---

## 🧪 Example usage

```ts
import { repairJson } from '@toolsy/json-repair';

const input = `{name: Seb, age: 42,}`;
const repaired = repairJson(input);
console.log(repaired);
// → {"name":"Seb","age":42}
```

---

## 🔧 Options

| Option         | Type     | Default | Description |
|----------------|----------|---------|-------------|
| `extractJson`  | boolean  | `false` | Extracts the first JSON block from surrounding text (useful for LLM output) |
| `encodeAscii`  | boolean  | `false` | Escapes non-ASCII characters (`é` → `\u00e9`) |
| `returnObject` | boolean  | `false` | If true, returns a JS object instead of a JSON string |
| `logging`      | boolean  | `false` | Enables console logs of each transformation step |
| `safeMode`     | boolean  | `false` | If true, throws a friendly error instead of crashing on unrecoverable input |

---

## ✅ Examples

| Input                               | Output                                  |
|------------------------------------|------------------------------------------|
| `{name: Seb}`                      | `{"name":"Seb"}`                        |
| `{user: {name: Seb, age: 30}}`     | `{"user":{"name":"Seb","age":30}}`      |
| `{value: NaN}`                     | `{"value":null}`                        |
| `'{"text": "Café"}'` + `encodeAscii: true` | `{"text":"Caf\u00e9"}`           |
| `Hello!\n\n\`\`\`json\n{name: Seb}`   | `{"name":"Seb"}`                        |

---

## 🧠 Motivation

This package was designed to help deal with **malformed JSON**, especially the kind you get from LLMs like ChatGPT or Copilot when asking for `json` output.

It can also be used to quickly recover and parse broken logs or hand-crafted config files.

---

## 🧩 Future plans

- Handle broken arrays and objects across multiple lines
- Add a CLI tool (`npx @toolsy/json-repair <file>`)
- Allow custom sanitization rules via plugins

---

## 👨‍💻 Author

Made with ❤️ by [@Seb](https://github.com/Sebog33)  
Follow [Toolsy](https://toolsy.cc) for more tiny dev-focused utilities.

---

## 📄 License

MIT
