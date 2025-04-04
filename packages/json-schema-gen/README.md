# @toolsycc/json-schema-gen

> A tiny and focused utility to generate lightweight JSON Schema objects, especially for OpenAI Function Calling or structured output.  
> ✅ Works with both **TypeScript** and **JavaScript** (ESM & CommonJS).

## Features

- Build clean JSON Schema from simple JS object structure
- Support for:
  - basic types: `string`, `number`, `integer`, `boolean`, `object`, `array`
  - optional `description` per field
  - `required` fields detection
  - nested object schemas
  - arrays with `items` definitions
- Minimal and dependency-free
- Output is compatible with OpenAI `functions` and `tool_choice: "auto"`

## Install

```bash
pnpm add @toolsycc/json-schema-gen
```

Or with npm:

```bash
npm install @toolsycc/json-schema-gen
```

## Example usage

### 🟦 TypeScript

```ts
import { generateSchema } from '@toolsycc/json-schema-gen';

const schema = generateSchema({
  name: { type: "string", description: "User name", required: true },
  age: { type: "integer", description: "User age" },
});

console.log(schema);
/*
{
  type: "object",
  properties: {
    name: { type: "string", description: "User name" },
    age: { type: "integer", description: "User age" }
  },
  required: ["name"]
}
*/
```

### 🟨 JavaScript (CommonJS)

```js
const { generateSchema } = require('@toolsycc/json-schema-gen');

const schema = generateSchema({
  id: { type: "string", required: true },
  tags: { type: "array", items: { type: "string" } }
});

console.log(schema);
```

### 🟩 JavaScript (ESM)

```js
import { generateSchema } from '@toolsycc/json-schema-gen';

const schema = generateSchema({
  enabled: { type: "boolean", description: "Whether the feature is active" }
});

console.log(schema);
```


## 🔁 Generate schema from real JSON data

You can generate a schema directly from a plain JavaScript object using `generateSchemaFromData`.

```ts
import { generateSchemaFromData } from '@toolsycc/json-schema-gen';

const data = {
  name: "Seb",
  age: 42,
  active: true,
  tags: ["dev", "founder"],
  address: {
    city: "Bordeaux",
    zip: "33000"
  }
};

const schema = generateSchemaFromData(data);
console.log(schema);

/*
{
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "integer" },
    active: { type: "boolean" },
    tags: {
      type: "array",
      items: { type: "string" }
    },
    address: {
      type: "object",
      properties: {
        city: { type: "string" },
        zip: { type: "string" }
      },
      required: ["city", "zip"]
    }
  },
  required: ["name", "age", "active", "tags", "address"]
}
*/
```



## ✅ Validate your data against a schema

You can also validate any data against a JSON Schema using `validateSchema`.

```ts
import { validateSchema } from '@toolsycc/json-schema-gen';

const schema = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "integer" },
    tags: { type: "array", items: { type: "string" } }
  },
  required: ["name", "age"]
};

const data = {
  name: "Seb",
  age: "not-a-number",
  tags: ["dev", "founder"]
};

const result = validateSchema(schema, data);
console.log(result.valid); // false
console.log(result.errors); // ['"age" should be an integer']
```


## Motivation

This package was designed to help generate **valid JSON Schema definitions**, especially in the context of OpenAI’s structured outputs or function calling APIs.  
It aims to provide a minimal abstraction with clean output and zero dependencies.

## Author

Made by [@Sebog33](https://github.com/Sebog33)  
Follow [Toolsy](https://www.toolsy.cc) for more tiny dev-focused utilities.

## License

MIT
