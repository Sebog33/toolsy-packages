import { describe, it, expect } from 'vitest';
import { repairJson } from '@/index';

describe('repairJson', () => {
  it('repairs unquoted keys and trailing comma', () => {
    const input = '{name: "Seb", age: 42,}';
    const result = repairJson(input);
    expect(result).toBe('{"name":"Seb","age":42}');
  });

  it('repairs unquoted string value', () => {
    const input = '{city: Paris}';
    const result = repairJson(input);
    expect(result).toBe('{"city":"Paris"}');
  });

  it('repairs unquoted string value with escaped quotes', () => {
    const input = '{"comment": "His name is "John"."}';
    const result = repairJson(input);
    expect(result).toBe('{"comment":"His name is \\"John\\"."}');
  });

  it('extracts JSON from LLM markdown block and repairs it', () => {
    const input = '```json\n{name: Seb, age: 30,}\n```';
    const result = repairJson(input, { extractJson: true });
    expect(result).toBe('{"name":"Seb","age":30}');
  });

  it('extracts JSON from LLM markdown block between text blocks and repairs it', () => {
    const input = 'Hello, this is the JSON:\n\n```json\n{name: Seb, age: 30,}\n```\n\nThanks!';
    const result = repairJson(input, { extractJson: true });
    expect(result).toBe('{"name":"Seb","age":30}');
  });

  it('returns JS object instead of string when returnObject is true', () => {
    const input = '{name: Seb}';
    const result = repairJson(input, { returnObject: true });
    expect(result).toEqual({ name: 'Seb' });
  });

  it('encodes non-ASCII characters to \\uXXXX format', () => {
    const input = '{"greeting": "Café"}';
    const result = repairJson(input, { encodeAscii: true });
    expect(result).toBe('{"greeting":"Caf\\u00e9"}');
  });

  it('replaces invalid JSON literal NaN with null', () => {
    const input = '{value: NaN}';
    const result = repairJson(input);
    expect(result).toBe('{"value":null}');
  });

  // it('throws a safe error if repair fails and safeMode is true', () => {
  //   const input = '{name: "Seb"'; // missing closing brace
  //   expect(() => repairJson(input, { safeMode: true })).toThrow('Unable to repair invalid JSON.');
  // });

  // Additional edge cases

  it('repairs nested unquoted keys', () => {
    const input = '{user: {name: Seb, age: 30}}';
    const result = repairJson(input);
    expect(result).toBe('{"user":{"name":"Seb","age":30}}');
  });

  it('repairs capitalized literals', () => {
    const input = '{valid: True, deleted: Null, open: FALSE}';
    const result = repairJson(input);
    expect(result).toBe('{"valid":true,"deleted":null,"open":false}');
  });

  it('repairs trailing comma in array', () => {
    const input = '["a", "b", ]';
    const result = repairJson(input);
    expect(result).toBe('["a","b"]');
  });

  it('normalizes line breaks inside string values', () => {
    const input = '{desc: "Line 1\nLine 2"}';
    const result = repairJson(input);
    expect(result).toBe('{"desc":"Line 1\\nLine 2"}');
  });

  it('repairs missing closing bracket', () => {
    const input = '{name: "Seb", age: 30';
    const result = repairJson(input);
    expect(result).toBe('{"name":"Seb","age":30}');
  });
});