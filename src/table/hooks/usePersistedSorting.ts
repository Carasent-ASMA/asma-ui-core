import { functionalUpdate, type OnChangeFn, type SortingState } from '@tanstack/react-table'
import { useCallback, useState } from 'react'
import { readJson } from '../helpers/tableStorage'

const SORTING_KEY_SUFFIX = ':sorting'
const SORTING_FORMAT_VERSION = 1
const NO_SORTING: SortingState = []

export const getSortingStorageKey = (uniqueKey?: string): string | undefined =>
    uniqueKey ? `${uniqueKey}${SORTING_KEY_SUFFIX}` : undefined

/** What a saved sort is checked against: the columns that can sort, and the multi-sort rules. */
export interface SortingRules {
    sortableColumns: readonly { id: string; canMultiSort: boolean }[]
    /** `false` keeps only the first saved entry. */
    enableMultiSort?: boolean
    maxMultiSortColCount?: number
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Checks a parsed `:sorting` value (`{"v":1,"sorting":[{"id","desc"}]}`) and returns the valid rest, or
 * `undefined` when it holds nothing usable and the app's default sorting should apply. A saved empty list
 * is a real answer (sorting turned off) and returns `[]`.
 */
export const sanitizeSorting = (raw: unknown, rules: SortingRules): SortingState | undefined => {
    if (!isRecord(raw) || raw['v'] !== SORTING_FORMAT_VERSION || !Array.isArray(raw['sorting'])) return undefined

    const saved: unknown[] = raw['sorting']

    if (saved.length === 0) return []

    const columns = new Map(rules.sortableColumns.map((column) => [column.id, column]))
    const seen = new Set<string>()
    const sorting: SortingState = []

    for (const entry of saved) {
        if (!isRecord(entry) || typeof entry['id'] !== 'string' || typeof entry['desc'] !== 'boolean') continue

        const column = columns.get(entry['id'])

        if (!column || seen.has(entry['id'])) continue

        // Only the first column can sort alone; a later one needs multi-sort to be allowed for it.
        if (sorting.length > 0 && (rules.enableMultiSort === false || !column.canMultiSort)) continue

        seen.add(entry['id'])
        sorting.push({ id: entry['id'], desc: entry['desc'] })
    }

    const max = rules.maxMultiSortColCount
    const capped = max !== undefined && Number.isFinite(max) && max >= 1 ? sorting.slice(0, Math.floor(max)) : sorting

    return capped.length > 0 ? capped : undefined
}

export const serializeSorting = (sorting: SortingState): string =>
    JSON.stringify({
        v: SORTING_FORMAT_VERSION,
        sorting: sorting.map(({ id, desc }) => ({ id, desc })),
    })

export const sortingSignature = (sorting: SortingState): string =>
    JSON.stringify(sorting.map(({ id, desc }) => [id, desc]))

export const readSortingFromStorage = (uniqueKey: string | undefined, rules: SortingRules): SortingState | undefined => {
    const storageKey = getSortingStorageKey(uniqueKey)

    return storageKey ? sanitizeSorting(readJson(storageKey), rules) : undefined
}

export interface PersistedSortingOptions {
    /** Ids of the columns the table can sort by; saved entries for any other column are dropped. */
    sortableColumnIds: readonly string[]
    /** Multi-sort rules of the table; both default to TanStack's (allowed, no cap). */
    enableMultiSort?: boolean
    maxMultiSortColCount?: number
}

const rulesFromOptions = ({
    sortableColumnIds,
    enableMultiSort,
    maxMultiSortColCount,
}: PersistedSortingOptions): SortingRules => ({
    sortableColumns: sortableColumnIds.map((id) => ({ id, canMultiSort: true })),
    enableMultiSort,
    maxMultiSortColCount,
})

/**
 * Reads the sorting `StyledTable` saved for `uniqueKey` (with `persistSorting`), checked against the columns
 * the caller can sort by. Synchronous and pure, so a table that owns its sorting state (for example because
 * the server sorts) can use the saved sort for its first request. Returns `undefined` when nothing valid is
 * saved, and `[]` when the user turned sorting off.
 */
export const readPersistedSorting = (
    uniqueKey: string | undefined,
    options: PersistedSortingOptions,
): SortingState | undefined => readSortingFromStorage(uniqueKey, rulesFromOptions(options))

/**
 * Sorting state for a table that owns `state.sorting`: the saved sort on the first render (before the first
 * request), `defaultSorting` when nothing valid is saved, and the new key's sort after `uniqueKey` changes.
 * It never writes: `StyledTable` with `persistSorting` is the only writer, and it takes the same default
 * from `initialState.sorting`, which Reset columns restores.
 *
 * ```tsx
 * const { sorting, onSortingChange } = usePersistedSorting({ uniqueKey, defaultSorting, sortableColumnIds })
 * <StyledTable uniqueKey={uniqueKey} persistSorting manualSorting state={{ sorting }}
 *     onSortingChange={onSortingChange} initialState={{ sorting: defaultSorting }} … />
 * ```
 */
export const usePersistedSorting = ({
    uniqueKey,
    defaultSorting = NO_SORTING,
    ...options
}: PersistedSortingOptions & { uniqueKey?: string; defaultSorting?: SortingState }): {
    sorting: SortingState
    onSortingChange: OnChangeFn<SortingState>
} => {
    const load = () => ({ key: uniqueKey, sorting: readPersistedSorting(uniqueKey, options) ?? defaultSorting })
    const [state, setState] = useState(load)
    let current = state

    // The key changed: take the new key's sort during this render, so no child ever sees the old one.
    if (state.key !== uniqueKey) {
        current = load()
        setState(current)
    }

    const onSortingChange = useCallback<OnChangeFn<SortingState>>(
        (updater) => setState((previous) => ({ ...previous, sorting: functionalUpdate(updater, previous.sorting) })),
        [],
    )

    return { sorting: current.sorting, onSortingChange }
}
