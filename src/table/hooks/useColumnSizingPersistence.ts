import { useMemo } from 'react'
import type { ColumnSizingState } from '@tanstack/react-table'
import { readJson } from '../helpers/tableStorage'

const COLUMN_SIZING_KEY_SUFFIX = ':column-sizing'

export const getColumnSizingStorageKey = (uniqueKey?: string): string | undefined =>
    uniqueKey ? `${uniqueKey}${COLUMN_SIZING_KEY_SUFFIX}` : undefined

/**
 * Checks a parsed `:column-sizing` value, which keeps its legacy unversioned shape `{ "<columnId>": <px> }`
 * so entries saved before ASMA-8597 still load. Only widths of known columns that are finite numbers above 0
 * are returned. Widths of columns that are not there (yet) are not applied but kept aside, see
 * `unknownColumnSizing`; values that are not widths are dropped. `undefined` means there is no usable saved
 * object.
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

/**
 * The saved widths of columns that are NOT among `knownColumnIds`, in the same shape check. They are not applied
 * (those columns don't exist yet) but kept, so a table that mounts before its columns are known can load them
 * when the columns appear (ASMA-8597, F5, U-W09).
 */
export const unknownColumnSizing = (raw: unknown, knownColumnIds: ReadonlySet<string>): ColumnSizingState => {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {}

    return Object.fromEntries(
        Object.entries(raw).filter(
            (entry): entry is [string, number] =>
                !knownColumnIds.has(entry[0]) &&
                typeof entry[1] === 'number' &&
                Number.isFinite(entry[1]) &&
                entry[1] > 0,
        ),
    )
}

const NO_WIDTHS: ColumnSizingState = {}

/**
 * For this key: the app's widths with the saved ones on top (`saved`, `undefined` when nothing is saved), and the
 * valid saved widths of columns that don't exist yet (`late`).
 */
export const usePersistedColumnSizing = (
    uniqueKey: string | undefined,
    leafColumnIds: readonly string[],
    defaultSizing: ColumnSizingState,
): { saved: ColumnSizingState | undefined; late: ColumnSizingState } =>
    useMemo(() => {
        const storageKey = getColumnSizingStorageKey(uniqueKey)
        const known = new Set(leafColumnIds)
        const raw = storageKey ? readJson(storageKey) : undefined
        const saved = sanitizeColumnSizing(raw, known)

        return {
            saved: saved && { ...defaultSizing, ...saved },
            late: storageKey ? unknownColumnSizing(raw, known) : NO_WIDTHS,
        }
        // Read once per key: a later change of the columns or defaults must not replace the user's widths, and
        // the late widths must outlive a write made before their columns appear.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uniqueKey])

/** Same entries in any key order count as the same widths. */
export const columnSizingSignature = (sizing: ColumnSizingState): string =>
    JSON.stringify(Object.entries(sizing).sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0)))

export const serializeColumnSizing = (sizing: ColumnSizingState): string => JSON.stringify(sizing)
