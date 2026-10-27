import { useMemo } from 'react'
import { readJson } from 'src/table/helpers/tableStorage'

export const usePersistedColumnOrder = (persistColumnOrderKey?: string): string[] | undefined => {
    const persistedColumnOrder = useMemo<string[] | undefined>(() => {
        if (!persistColumnOrderKey) return undefined

        const parsed = readJson(persistColumnOrderKey)

        return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : undefined
    }, [persistColumnOrderKey])

    return persistedColumnOrder
}
