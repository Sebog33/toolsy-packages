export type DiffResult = {
  added: Record<string, any>
  removed: Record<string, any>
  changed: Record<string, [any, any]>
}

export function diffJson(a: any, b: any): DiffResult {
  const added: Record<string, any> = {}
  const removed: Record<string, any> = {}
  const changed: Record<string, [any, any]> = {}

  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})])

  for (const key of keys) {
    const valA = a?.[key]
    const valB = b?.[key]

    if (!(key in a)) {
      added[key] = valB
    } else if (!(key in b)) {
      removed[key] = valA
    } else if (isObject(valA) && isObject(valB)) {
      const sub = diffJson(valA, valB)
      if (Object.keys(sub.added).length || Object.keys(sub.removed).length || Object.keys(sub.changed).length) {
        changed[key] = [valA, valB]
      }
    } else if (!isEqual(valA, valB)) {
      changed[key] = [valA, valB]
    }
  }

  return { added, removed, changed }
}

export function intersectJson(a: any, b: any): any {
  if (!isObject(a) || !isObject(b)) return undefined
  const result: Record<string, any> = {}
  for (const key in a) {
    if (key in b) {
      const valA = a[key]
      const valB = b[key]
      if (isObject(valA) && isObject(valB)) {
        const sub = intersectJson(valA, valB)
        if (sub && Object.keys(sub).length) result[key] = sub
      } else if (isEqual(valA, valB)) {
        result[key] = valA
      }
    }
  }
  return result
}

export function subtractJson(a: any, b: any): any {
  if (!isObject(a)) return a
  if (!isObject(b)) return a
  const result: Record<string, any> = {}
  for (const key in a) {
    if (!(key in b)) {
      result[key] = a[key]
    } else {
      const valA = a[key]
      const valB = b[key]
      if (isObject(valA) && isObject(valB)) {
        const sub = subtractJson(valA, valB)
        if (Object.keys(sub).length > 0) result[key] = sub
      } else if (!isEqual(valA, valB)) {
        result[key] = valA
      }
    }
  }
  return result
}

export function isObject(value: any): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}