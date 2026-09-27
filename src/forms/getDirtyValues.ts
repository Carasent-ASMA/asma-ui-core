export function getDirtyValues<T extends Record<string, unknown>>(
    dirtyFields: Partial<Record<keyof T, unknown>> | boolean | undefined,
    values: T,
): Partial<T> {
    if (dirtyFields === true) return { ...values }
    if (!dirtyFields || typeof dirtyFields !== 'object') return {}

    const result: Partial<T> = {}

    for (const key of Object.keys(dirtyFields) as (keyof T)[]) {
        const dirty = dirtyFields[key]
        const value = values[key]

        if (dirty === true) {
            result[key] = value
            continue
        }

        if (Array.isArray(value)) {
            if (dirty) result[key] = value
            continue
        }

        if (dirty && typeof dirty === 'object' && value != null && typeof value === 'object') {
            const nested = getDirtyValues(dirty as Partial<Record<string, unknown>>, value as Record<string, unknown>)
            if (Object.keys(nested).length > 0) {
                result[key] = nested as T[keyof T]
            }
        }
    }

    return result
}
