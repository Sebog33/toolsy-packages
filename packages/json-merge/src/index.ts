export type MergeOptions = {
  arrayStrategy?: 'replace' | 'concat'
  depthLimit?: number
  ignoreKeys?: string[]
  preserveUndefined?: boolean
  customMerge?: (key: string, val1: any, val2: any) => any
  dateStrategy?: 'copy' | 'stringify' | 'timestamp'
  overwriteFalsy?: boolean
  cloneInputs?: boolean
}

export function deepMerge<T = any>(
  target: T,
  source: T,
  options: MergeOptions = {}
): T {
  const {
    arrayStrategy = 'replace',
    depthLimit = Infinity,
    ignoreKeys = [],
    preserveUndefined = false,
    customMerge,
    dateStrategy = 'copy',
    overwriteFalsy = true,
    cloneInputs = true
  } = options

  if (depthLimit === 0) return source

  const result = cloneInputs ? { ...target } : target

  for (const key in source) {
    if (ignoreKeys.includes(key)) continue

    const val1 = (result as any)[key]
    const val2 = (source as any)[key]

    if (customMerge) {
      (result as any)[key] = customMerge(key, val1, val2)
      continue
    }

    if (val2 instanceof Date) {
      switch (dateStrategy) {
        case 'stringify':
          (result as any)[key] = val2.toISOString()
          break
        case 'timestamp':
          (result as any)[key] = val2.getTime()
          break
        default:
          (result as any)[key] = new Date(val2.getTime())
      }
      continue
    }

    if (
      val2 &&
      typeof val2 === 'object' &&
      !Array.isArray(val2) &&
      !(val2 instanceof Date)
    ) {
      (result as any)[key] = deepMerge(val1 || {}, val2, {
        arrayStrategy,
        depthLimit: depthLimit - 1,
        ignoreKeys,
        preserveUndefined,
        customMerge,
        dateStrategy,
        overwriteFalsy,
        cloneInputs
      })
    } else if (Array.isArray(val2)) {
      if (arrayStrategy === 'concat' && Array.isArray(val1)) {
        (result as any)[key] = [...val1, ...val2]
      } else {
        (result as any)[key] = val2
      }
    } else {
      if (val2 === undefined && !preserveUndefined) continue
      if (!overwriteFalsy && val2 == null) continue
      (result as any)[key] = val2
    }
  }

  return result
}

export function mergeMany(objects: object[], options?: MergeOptions) {
  return objects.reduce((acc, obj) => deepMerge(acc, obj, options), {})
}
