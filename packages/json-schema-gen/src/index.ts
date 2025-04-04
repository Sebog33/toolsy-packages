export type SchemaField = {
  type: "string" | "number" | "integer" | "boolean" | "object" | "array";
  description?: string;
  required?: boolean;
  properties?: Record<string, SchemaField>; // for nested objects
  items?: SchemaField; // for arrays
};

export type JsonSchemaType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array"
  | "null";

export type JsonSchema = {
  type: JsonSchemaType;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
};

export function validateSchema(
  schema: JsonSchema,
  data: any
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (schema.type !== "object" || typeof data !== "object" || data === null || Array.isArray(data)) {
    return { valid: false, errors: ["Root must be an object"] };
  }

  const props = schema.properties || {};
  const required = schema.required || [];

  for (const key of required) {
    if (!(key in data)) {
      errors.push(`Missing required field: "${key}"`);
    }
  }

  for (const [key, definition] of Object.entries(props)) {
    const value = data[key];
    if (value === undefined) continue;

    switch (definition.type) {
      case "string":
        if (typeof value !== "string") errors.push(`"${key}" should be a string`);
        break;

      case "number":
        if (typeof value !== "number") errors.push(`"${key}" should be a number`);
        break;

      case "integer":
        if (!Number.isInteger(value)) errors.push(`"${key}" should be an integer`);
        break;

      case "boolean":
        if (typeof value !== "boolean") errors.push(`"${key}" should be a boolean`);
        break;

      case "object":
        if (typeof value !== "object" || value === null || Array.isArray(value)) {
          errors.push(`"${key}" should be an object`);
        } else {
          const nested = validateSchema(definition, value);
          nested.errors.forEach(e => errors.push(`${key}.${e}`));
        }
        break;

      case "array":
        if (!Array.isArray(value)) {
          errors.push(`"${key}" should be an array`);
        } else if (definition.items) {
          value.forEach((item: any, index: number) => {
            const nested = validateSchema(
              {
                type: "object",
                properties: { item: definition.items! },
                required: ["item"]
              },
              { item }
            );
            nested.errors.forEach(e => errors.push(`${key}[${index}].${e}`));
          });
        }
        break;

      case "null":
        if (value !== null) errors.push(`"${key}" should be null`);
        break;

      default:
        errors.push(`"${key}" has unsupported type: ${definition.type}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function generateSchema(fields: Record<string, SchemaField>) {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  for (const [key, config] of Object.entries(fields)) {
    const { required: isRequired, ...rest } = config;
    properties[key] = rest;
    if (isRequired) required.push(key);
  }

  return {
    type: "object",
    properties,
    ...(required.length > 0 ? { required } : {})
  };
}

export function generateSchemaFromData(data: any): any {
  const detectType = (value: any): any => {
    if (Array.isArray(value)) {
      return {
        type: "array",
        items: value.length > 0 ? detectType(value[0]) : {}
      };
    } else if (value === null) {
      return { type: "null" };
    } else if (typeof value === "object") {
      return generateSchemaFromData(value);
    } else if (typeof value === "number") {
      return Number.isInteger(value) ? { type: "integer" } : { type: "number" };
    } else if (typeof value === "boolean") {
      return { type: "boolean" };
    } else if (typeof value === "string") {
      return { type: "string" };
    } else {
      return { type: "string" };
    }
  };

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error("Input must be a plain object");
  }

  const properties: Record<string, any> = {};
  const required: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    properties[key] = detectType(value);
    required.push(key);
  }

  return {
    type: "object",
    properties,
    required
  };
}