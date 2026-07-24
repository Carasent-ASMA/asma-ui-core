import { useMemo } from 'react'

const pageSizeStorageKeySuffix = ':page-size'

export const getPersistedPageSizeKey = (uniqueKey?: string): string| undefined => {
    if (!uniqueKey) return undefined

    return `${uniqueKey}${pageSizeStorageKeySuffix}`
}

export const usePersistedPageSize = (uniqueKey?: string): number| undefined => {
    const persistedPageSize = useMemo<number | undefined>(() => {
        const storageKey = getPersistedPageSizeKey(uniqueKey)

        if (!storageKey) return undefined

        try {
            const raw = localStorage.getItem(storageKey)

            if (!raw) return undefined

            const parsed: unknown = JSON.parse(raw)

            return typeof parsed === 'number' && Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
        } catch {
            return undefined
        }
    }, [uniqueKey])

    return persistedPageSize
}