import { useMemo } from 'react'
import type { ColumnSizingState } from '@tanstack/react-table'
import { readJson } from '../helpers/tableStorage'

const COLUMN_SIZING_KEY_SUFFIX = ':column-sizing'

export const getColumnSizingStorageKey = (uniqueKey?: string): string | undefined =>
    uniqueKey ? `${uniqueKey}${COLUMN_SIZING_KEY_SUFFIX}` : undefined

/**
 * Checks a parsed `:column-sizing` value, which keeps its legacy unversioned shape `{ "<columnId>": <px> }` so
 * entries saved before ASMA-8597 still load. Every width that is a finite number above 0 is kept, including the
 * width of a column that is not there at the moment: TanStack applies a width only to a column that exists and
 * picks it up when the column appears, which is what master does (ASMA-8597, DEC-W). An id that matches no column
 * therefore has no effect and causes no error. Values that are not widths are dropped. `undefined` means there is
 * no usable saved object.
 */
export const sanitizeColumnSizing = (raw: unknown): ColumnSizingState | undefined => {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return undefined

    return Object.fromEntries(
        Object.entries(raw).filter(
            (entry): entry is [string, number] =>
                typeof entry[1] === 'number' && Number.isFinite(entry[1]) && entry[1] > 0,
        ),
    )
}

/** The app's widths with the saved ones on top, or `undefined` when nothing is saved for this key. */
export const usePersistedColumnSizing = (
    uniqueKey: string | undefined,
    defaultSizing: ColumnSizingState,
): ColumnSizingState | undefined =>
    useMemo(() => {
        const storageKey = getColumnSizingStorageKey(uniqueKey)
        const saved = storageKey ? sanitizeColumnSizing(readJson(storageKey)) : undefined

        return saved && { ...defaultSizing, ...saved }
        // Read once per key: a later change of the defaults must not replace the user's widths.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uniqueKey])

/** Same entries in any key order count as the same widths. */
export const columnSizingSignature = (sizing: ColumnSizingState): string =>
    JSON.stringify(Object.entries(sizing).sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0)))

export const serializeColumnSizing = (sizing: ColumnSizingState): string => JSON.stringify(sizing)
