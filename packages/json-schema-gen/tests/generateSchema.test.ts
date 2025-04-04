import { describe, it, expect } from "vitest";
import { generateSchema, generateSchemaFromData, validateSchema, JsonSchema } from "../src/index";

describe("validateSchema", () => {
  it("should validate a correct object", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "integer" },
        active: { type: "boolean" }
      },
      required: ["name", "age", "active"]
    };

    const data = {
      name: "Seb",
      age: 42,
      active: true
    };

    const result = validateSchema(schema, data);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it("should detect missing required fields", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "integer" }
      },
      required: ["name", "age"]
    };

    const data = { name: "Seb" };
    const result = validateSchema(schema, data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required field: "age"');
  });

  it("should detect invalid types", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        age: { type: "integer" },
        tags: { type: "array", items: { type: "string" } }
      },
      required: ["age", "tags"]
    };

    const data = {
      age: "not a number",
      tags: ["dev", 42]
    };

    const result = validateSchema(schema, data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('"age" should be an integer');
    expect(result.errors).toContain('tags[1]."item" should be a string');
  });

  it("should validate nested object structure", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        profile: {
          type: "object",
          properties: {
            email: { type: "string" },
            score: { type: "number" }
          },
          required: ["email", "score"]
        }
      },
      required: ["profile"]
    };

    const data = {
      profile: {
        email: "seb@example.com",
        score: "not-a-number"
      }
    };

    const result = validateSchema(schema, data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('profile."score" should be a number');
  });
});

describe("generateSchema", () => {
  it("should generate a schema from a basic JSON object", () => {
    const data = {
      name: "Seb",
      age: 42,
      active: true
    };
    const result = generateSchemaFromData(data);
    expect(result).toEqual({
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "integer" },
        active: { type: "boolean" }
      },
      required: ["name", "age", "active"]
    });
  });

  it("should detect nested objects and arrays", () => {
    const data = {
      address: {
        city: "Paris",
        zip: "75000"
      },
      tags: ["dev", "ai"]
    };
    const result = generateSchemaFromData(data);
    expect(result).toEqual({
      type: "object",
      properties: {
        address: {
          type: "object",
          properties: {
            city: { type: "string" },
            zip: { type: "string" }
          },
          required: ["city", "zip"]
        },
        tags: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["address", "tags"]
    });
  });

  it("should generate a basic schema with required fields", () => {
    const result = generateSchema({
      name: { type: "string", description: "User name", required: true },
      age: { type: "integer", description: "User age", required: false }
    });

    expect(result).toEqual({
      type: "object",
      properties: {
        name: { type: "string", description: "User name" },
        age: { type: "integer", description: "User age" }
      },
      required: ["name"]
    });
  });

  it("should handle nested objects", () => {
    const result = generateSchema({
      user: {
        type: "object",
        description: "User object",
        required: true,
        properties: {
          email: { type: "string", description: "Email address", required: true }
        }
      }
    });

    expect(result).toEqual({
      type: "object",
      properties: {
        user: {
          type: "object",
          description: "User object",
          properties: {
            email: { type: "string", description: "Email address", required: true }
          }
        }
      },
      required: ["user"]
    });
  });

  it("should include array definitions", () => {
    const result = generateSchema({
      tags: {
        type: "array",
        description: "List of tags",
        items: { type: "string" },
        required: false
      }
    });

    expect(result).toEqual({
      type: "object",
      properties: {
        tags: {
          type: "array",
          description: "List of tags",
          items: { type: "string" }
        }
      }
    });
  });
});
