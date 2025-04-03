import { describe, it, expect } from 'vitest'
import { diffJson, intersectJson, subtractJson } from '@/index'

describe('diffJson', () => {
  it('should detect added, removed, and changed keys', () => {
    const a = { name: 'Seb', age: 42, extra: true }
    const b = { name: 'Seb', age: 33 }

    const result = diffJson(a, b)
    expect(result).toEqual({
      added: {},
      removed: { extra: true },
      changed: { age: [42, 33] }
    })
  })

  it('should detect deeply nested differences', () => {
    const a = { user: { name: 'Seb', age: 42 } }
    const b = { user: { name: 'Seb', age: 33 } }

    const result = diffJson(a, b)
    expect(result.changed).toHaveProperty('user')
  })
})

describe('intersectJson', () => {
  it('should return only identical key-values', () => {
    const a = { name: 'Seb', age: 42, city: 'Paris' }
    const b = { name: 'Seb', age: 33, country: 'FR' }

    const result = intersectJson(a, b)
    expect(result).toEqual({ name: 'Seb' })
  })

  it('should work with nested objects', () => {
    const a = { user: { name: 'Seb', age: 42 } }
    const b = { user: { name: 'Seb', age: 33 } }

    const result = intersectJson(a, b)
    expect(result).toEqual({ user: { name: 'Seb' } })
  })
})

describe('subtractJson', () => {
  it('should remove matching keys and values from a', () => {
    const a = { name: 'Seb', age: 42, extra: true }
    const b = { name: 'Seb', age: 33 }

    const result = subtractJson(a, b)
    expect(result).toEqual({ age: 42, extra: true })
  })

  it('should handle nested objects correctly', () => {
    const a = { user: { name: 'Seb', age: 42, role: 'admin' } }
    const b = { user: { name: 'Seb', age: 33 } }

    const result = subtractJson(a, b)
    expect(result).toEqual({ user: { age: 42, role: 'admin' } })
  })
})