import { useMemo } from 'react'
import type { ColumnSizingState } from '@tanstack/react-table'
import { readJson } from '../helpers/tableStorage'

const COLUMN_SIZING_KEY_SUFFIX = ':column-sizing'

export const getColumnSizingStorageKey = (uniqueKey?: string): string | undefined =>
    uniqueKey ? `${uniqueKey}${COLUMN_SIZING_KEY_SUFFIX}` : undefined

/**
 * Checks a parsed `:column-sizing` value, which keeps its legacy unversioned shape `{ "<columnId>": <px> }`
 * so entries saved before ASMA-8597 still load. Unknown columns and values that are not finite numbers above
 * 0 are dropped; the valid rest is kept. `undefined` means there is no usable saved object.
 */
export const sanitizeColumnSizing = (raw: unknown, knownColumnIds: ReadonlySet<string>): ColumnSizingState | undefined => {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return undefined

    return Object.fromEntries(
        Object.entries(raw).filter(
            (entry): entry is [string, number] =>
                knownColumnIds.has(entry[0]) &&
                typeof entry[1] === 'number' &&
                Number.isFinite(entry[1]) &&
                entry[1] > 0,
        ),
    )
}

export const readColumnSizingFromStorage = (
    uniqueKey: string | undefined,
    knownColumnIds: ReadonlySet<string>,
): ColumnSizingState | undefined => {
    const storageKey = getColumnSizingStorageKey(uniqueKey)

    return storageKey ? sanitizeColumnSizing(readJson(storageKey), knownColumnIds) : undefined
}

/** The app's widths with the saved ones on top, or `undefined` when nothing is saved for this key. */
export const usePersistedColumnSizing = (
    uniqueKey: string | undefined,
    leafColumnIds: readonly string[],
    defaultSizing: ColumnSizingState,
): ColumnSizingState | undefined =>
    useMemo(() => {
        const saved = readColumnSizingFromStorage(uniqueKey, new Set(leafColumnIds))

        return saved && { ...defaultSizing, ...saved }
        // Read once per key: a later change of the columns or defaults must not replace the user's widths.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uniqueKey])

/** Same entries in any key order count as the same widths. */
export const columnSizingSignature = (sizing: ColumnSizingState): string =>
    JSON.stringify(Object.entries(sizing).sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0)))

export const serializeColumnSizing = (sizing: ColumnSizingState): string => JSON.stringify(sizing)
