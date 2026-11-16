import { useMemo } from 'react'
import { tableStorage } from '../helpers/tableStorage'

const pageSizeStorageKeySuffix = ':page-size'

/** The page size a `StyledTable` opens with when it is given no `pageSize` and the user has saved none. */
export const DEFAULT_TABLE_PAGE_SIZE = 50

/** A saved page size: a positive whole number, as `${uniqueKey}:page-size` holds it. Anything else is not a page size. */
export const parseSavedPageSize = (raw: string | null): number | undefined => {
    if (!raw) return undefined

    try {
        const parsed: unknown = JSON.parse(raw)

        return typeof parsed === 'number' && Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
    } catch {
        return undefined
    }
}

export const getPersistedPageSizeKey = (uniqueKey?: string): string| undefined => {
    if (!uniqueKey) return undefined

    return `${uniqueKey}${pageSizeStorageKeySuffix}`
}

export const usePersistedPageSize = (uniqueKey?: string): number| undefined => {
    const persistedPageSize = useMemo<number | undefined>(() => {
        const storageKey = getPersistedPageSizeKey(uniqueKey)

        if (!storageKey) return undefined

        return parseSavedPageSize(tableStorage.get(storageKey))
    }, [uniqueKey])

    return persistedPageSize
}