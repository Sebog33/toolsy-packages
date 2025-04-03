import { describe, it, expect } from 'vitest';
import { deepMerge, mergeMany } from '@/index';

describe('deepMerge', () => {
  it('should merge simple objects', () => {
    const a = { foo: 'bar' }
    const b = { baz: 42 }
    expect(deepMerge(a, b)).toEqual({ foo: 'bar', baz: 42 })
  })

  it('should merge nested objects deeply', () => {
    const a = { foo: { bar: 1 } }
    const b = { foo: { baz: 2 } }
    expect(deepMerge(a, b)).toEqual({ foo: { bar: 1, baz: 2 } })
  })

  it('should concat arrays when specified', () => {
    const a = { list: [1, 2] }
    const b = { list: [3] }
    expect(deepMerge(a, b, { arrayStrategy: 'concat' })).toEqual({
      list: [1, 2, 3]
    })
  })

  it('should preserve undefined if option is true', () => {
    const a = { foo: 1 }
    const b = { bar: undefined }
    const result = deepMerge(a, b, { preserveUndefined: true })
    expect(Object.keys(result)).toContain('bar')
    expect(result).toHaveProperty('bar', undefined)
  })
  
  it('should respect customMerge function', () => {
    const a = { foo: 1 }
    const b = { foo: 2, bar: 3 }
    const result = deepMerge(a, b, {
      customMerge: (key, val1, val2) => (key === 'foo' ? val1 : val2)
    })
    expect(result).toEqual({ foo: 1, bar: 3 })
  })
  
  it('should apply dateStrategy: stringify', () => {
    const a = {}
    const b = { created: new Date('2024-01-01') }
    const result = deepMerge(a, b, { dateStrategy: 'stringify' })
    expect(result.created).toBe('2024-01-01T00:00:00.000Z')
  })
  
  it('should not overwrite falsy values if overwriteFalsy is false', () => {
    const a = { score: 10 }
    const b = { score: null }
    const result = deepMerge(a, b, { overwriteFalsy: false })
    expect(result.score).toBe(10)
  })
  
  it('should mutate target if cloneInputs is false', () => {
    const a = { foo: { bar: 1 } }
    const b = { foo: { baz: 2 } }
    const merged = deepMerge(a, b, { cloneInputs: false })
    expect(merged).toBe(a) // same object ref
    expect(a.foo).toEqual({ bar: 1, baz: 2 })
  })
  
  it('should merge many objects with mergeMany', () => {
    const objs = [{ a: 1 }, { b: 2 }, { a: 3 }]
    const result = mergeMany(objs)
    expect(result).toEqual({ a: 3, b: 2 })
  })
  
})