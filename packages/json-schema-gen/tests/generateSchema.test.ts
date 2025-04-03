import { describe, it, expect } from "vitest";
import { generateSchema } from "../src/index";

describe("generateSchema", () => {
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
