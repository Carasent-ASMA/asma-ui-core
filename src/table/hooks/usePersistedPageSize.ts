import { useMemo } from 'react'
import { readJson } from '../helpers/tableStorage'

const pageSizeStorageKeySuffix = ':page-size'

export const getPersistedPageSizeKey = (uniqueKey?: string): string| undefined => {
    if (!uniqueKey) return undefined

    return `${uniqueKey}${pageSizeStorageKeySuffix}`
}

export const usePersistedPageSize = (uniqueKey?: string): number| undefined => {
    const persistedPageSize = useMemo<number | undefined>(() => {
        const storageKey = getPersistedPageSizeKey(uniqueKey)

        if (!storageKey) return undefined

        const parsed = readJson(storageKey)

        return typeof parsed === 'number' && Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
    }, [uniqueKey])

    return persistedPageSize
}