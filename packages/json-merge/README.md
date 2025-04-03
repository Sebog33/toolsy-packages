# @toolsycc/json-merge

> A flexible and immutable JSON object merger — perfect for config files, runtime overrides or structured data.  
> ✅ Fully typed, lightweight and easy to use in both **TypeScript** and **JavaScript** (ESM & CommonJS).

## Features

- Deep recursive merge
- Optional array merging (`replace` or `concat`)
- Ignore keys from merge
- Custom merge logic per key
- Merge depth limit
- Date handling strategies
- Falsy overwrite toggle
- Clone or mutate input objects
- Merge multiple objects via `mergeMany`

## Install

```bash
pnpm add @toolsycc/json-merge
```

Or with npm:

```bash
npm install @toolsycc/json-merge
```

## Example usage

```ts
import { deepMerge } from '@toolsycc/json-merge'

const base = { user: { name: "Seb", roles: ["admin"] } }
const override = { user: { age: 42, roles: ["editor"] } }

const result = deepMerge(base, override, { arrayStrategy: 'concat' })
// → { user: { name: "Seb", age: 42, roles: ["admin", "editor"] } }
```

## API

### `deepMerge(obj1, obj2, options?)`

| Option              | Type                                | Default      | Description |
|---------------------|-------------------------------------|--------------|-------------|
| `arrayStrategy`     | `"replace"` \| `"concat"`           | `"replace"`  | How to merge arrays |
| `depthLimit`        | `number`                            | `Infinity`   | Max depth of recursion |
| `ignoreKeys`        | `string[]`                          | `[]`         | Keys to skip |
| `preserveUndefined` | `boolean`                           | `false`      | Keeps `undefined` keys |
| `customMerge`       | `(key, val1, val2) => any`          | `undefined`  | Custom logic per key |
| `dateStrategy`      | `"copy"` \| `"stringify"` \| `"timestamp"` | `"copy"` | How to handle Dates |
| `overwriteFalsy`    | `boolean`                           | `true`       | Whether to overwrite with falsy values (`null`, `false`, etc.) |
| `cloneInputs`       | `boolean`                           | `true`       | If false, mutates target object |

### `mergeMany(objects: object[], options?)`

Merges all objects left-to-right using `deepMerge`.

```ts
mergeMany([{ a: 1 }, { b: 2 }, { a: 3 }])
// → { a: 3, b: 2 }
```

## License

MIT
