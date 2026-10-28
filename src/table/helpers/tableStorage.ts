/**
 * The one door to `localStorage` for everything a table saves (ASMA-8597, REQ-007). Blocked, full or
 * private-mode storage, and a `localStorage` getter that itself throws (`SecurityError`), must leave the
 * table working in memory: no throw, no console output, no error UI.
 */
export const tableStorage = {
    get(key: string): string | null {
        try {
            return localStorage.getItem(key)
        } catch {
            return null
        }
    },
    set(key: string, value: string): void {
        try {
            localStorage.setItem(key, value)
        } catch {
            // Quota or blocked storage: the setting stays in memory only.
        }
    },
    remove(key: string): void {
        try {
            localStorage.removeItem(key)
        } catch {
            // Blocked storage: nothing to remove.
        }
    },
}

/** Parses a saved value; anything that is not valid JSON counts as nothing saved. */
export const readJson = (key: string): unknown => {
    const raw = tableStorage.get(key)

    if (!raw) return undefined

    try {
        return JSON.parse(raw) as unknown
    } catch {
        return undefined
    }
}
