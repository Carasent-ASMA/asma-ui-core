/**
 * A `localStorage` stand-in for the node `unit` project, where no `localStorage` exists. Installs itself on
 * `globalThis` and returns the backing map so a test can read and seed raw entries.
 */
export const installMemoryStorage = (): { data: Map<string, string>; restore: () => void } => {
    const data = new Map<string, string>()
    const storage: Storage = {
        get length() {
            return data.size
        },
        clear: () => data.clear(),
        getItem: (key) => data.get(key) ?? null,
        key: (index) => [...data.keys()][index] ?? null,
        removeItem: (key) => {
            data.delete(key)
        },
        setItem: (key, value) => {
            data.set(key, String(value))
        },
    }
    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')

    Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true, writable: true })

    return {
        data,
        restore: () => {
            if (original) Object.defineProperty(globalThis, 'localStorage', original)
            else delete (globalThis as { localStorage?: Storage }).localStorage
        },
    }
}

/** Makes every console method throw, so a test proves a code path stays silent. */
export const failOnConsoleOutput = (vi: { spyOn: (...args: never[]) => unknown }): void => {
    for (const method of ['error', 'warn', 'log', 'info'] as const) {
        ;(vi.spyOn as (object: Console, method: string) => { mockImplementation: (fn: () => void) => void })(
            console,
            method,
        ).mockImplementation(() => {
            throw new Error(`console.${method} was called`)
        })
    }
}
