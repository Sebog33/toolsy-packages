export type SchemaField = {
  type: "string" | "number" | "integer" | "boolean" | "object" | "array";
  description?: string;
  required?: boolean;
  properties?: Record<string, SchemaField>; // for nested objects
  items?: SchemaField; // for arrays
};

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
