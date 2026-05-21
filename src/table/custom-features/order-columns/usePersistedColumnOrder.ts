import { useMemo } from 'react'

export const usePersistedColumnOrder = (persistColumnOrderKey?: string) => {
    const persistedColumnOrder = useMemo<string[] | undefined>(() => {
        if (!persistColumnOrderKey) return undefined
        try {
            const raw = localStorage.getItem(persistColumnOrderKey)
            if (!raw) return undefined
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed) ? parsed : undefined
        } catch {
            return undefined
        }
    }, [persistColumnOrderKey])

    return persistedColumnOrder
}
