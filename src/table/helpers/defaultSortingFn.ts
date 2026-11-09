import type { BuiltInSortingFn, SortingFn, Table } from '@tanstack/react-table'

/**
 * The comparison every `StyledTable` column uses unless the column, or the app's `defaultColumn`, names its own `sortingFn`
 * (ASMA-8597, P2f, DEC-SORTFN). It is registered as `sortingFns.styledDefault`.
 *
 * - Empty cells (`undefined`, `null`, `''`, whitespace only, `NaN`, an invalid `Date`) go last in both directions. Two empty
 *   cells tie.
 * - Numbers, `Date`s and booleans compare by value; two ISO 8601 date strings compare by time.
 * - Any other two strings, and two values of different types, compare as text in the table locale: case and accents are
 *   ignored and digit runs compare as numbers (`svc-9` before `svc-10`).
 * - Ties return 0, so TanStack keeps the data order.
 */

/**
 * The name the comparison is registered under in the table's `sortingFns`. It is typed as a built-in name because TanStack's
 * `SortingFns` interface, which would let `'styledDefault'` type-check, turns `sortingFns` into a required prop of every
 * `StyledTable` once it is augmented; the table registers the function itself, so no app needs to.
 */
export const STYLED_DEFAULT_SORTING_FN = 'styledDefault' as unknown as BuiltInSortingFn

/** ui-core calls Norwegian `no`; `Intl` calls it `nb`. */
const toIntlLocale = (locale: string | undefined): string => (locale === 'no' ? 'nb' : (locale ?? 'en'))

const collators = new Map<string, Intl.Collator>()

/** One collator per locale: building one is the expensive part of a text comparison. */
export const getSortCollator = (locale?: string): Intl.Collator => {
    const intlLocale = toIntlLocale(locale)
    let collator = collators.get(intlLocale)

    if (!collator) {
        collator = new Intl.Collator(intlLocale, { numeric: true, sensitivity: 'base' })
        collators.set(intlLocale, collator)
    }

    return collator
}

/** `YYYY-MM-DD`, optionally followed by a time with an optional fraction and offset. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:[.,]\d+)?)?(?:Z|[+-]\d{2}(?::?\d{2})?)?)?$/

/** The time an ISO 8601 date string stands for, or `undefined` when the string is not one (or names no real date). */
const isoTime = (value: string): number | undefined => {
    if (!ISO_DATE.test(value)) return undefined

    const time = Date.parse(value.replace(' ', 'T').replace(',', '.'))

    return Number.isNaN(time) ? undefined : time
}

/** Whether a cell has no value to sort on: such cells always go last. */
export const isEmptySortValue = (value: unknown): boolean =>
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '') ||
    (typeof value === 'number' && Number.isNaN(value)) ||
    (value instanceof Date && Number.isNaN(value.getTime()))

const compareNumbers = (a: number, b: number): number => (a < b ? -1 : a > b ? 1 : 0)

/** Compares two cells that are not empty, ascending. A tie is exactly 0. */
export const compareSortValues = (a: unknown, b: unknown, collator: Intl.Collator): number => {
    if (typeof a === 'number' && typeof b === 'number') return compareNumbers(a, b)
    if (a instanceof Date && b instanceof Date) return compareNumbers(a.getTime(), b.getTime())
    // `false` before `true`.
    if (typeof a === 'boolean' && typeof b === 'boolean') return compareNumbers(Number(a), Number(b))

    if (typeof a === 'string' && typeof b === 'string') {
        const timeA = isoTime(a)
        const timeB = isoTime(b)

        if (timeA !== undefined && timeB !== undefined) return compareNumbers(timeA, timeB)

        return collator.compare(a, b) || 0
    }

    // Two different types, or a type with no order of its own: as text, so the result is still deterministic.
    return collator.compare(String(a), String(b)) || 0
}

/**
 * Builds the comparison. TanStack hands a sorting function only `(rowA, rowB, columnId)` and flips its result afterwards
 * for a descending sort and for `invertSorting`, so an empty cell would swap ends with the direction. To keep it last the
 * comparison reads the column's direction and `invertSorting` live from the table (`getTable` returns the table of the
 * render that sorts) and returns the sign that comes out "after" once TanStack has applied both flips.
 */
export const createStyledDefaultSortingFn =
    <TData>(getTable: () => Table<TData> | undefined): SortingFn<TData> =>
    (rowA, rowB, columnId) => {
        const a = rowA.getValue(columnId)
        const b = rowB.getValue(columnId)
        const aEmpty = isEmptySortValue(a)
        const bEmpty = isEmptySortValue(b)
        const table = getTable()

        if (aEmpty || bEmpty) {
            if (aEmpty && bEmpty) return 0

            // This column's own entry, not the first one: with several sorted columns each has its own direction.
            const isDesc = table?.getState().sorting.find((entry) => entry.id === columnId)?.desc ?? false
            const isInverted = table?.getColumn(columnId)?.columnDef.invertSorting ?? false
            // What TanStack multiplies the result by: -1 for each of "descending" and "inverted".
            const flip = (isDesc ? -1 : 1) * (isInverted ? -1 : 1)

            return aEmpty ? flip : -flip
        }

        return compareSortValues(a, b, getSortCollator(table?.options.meta?.locale))
    }

/** The parts of a column definition that decide whether the default comparison applies to it. */
interface SortUndefinedColumnDef {
    sortingFn?: unknown
    sortUndefined?: unknown
    columns?: readonly SortUndefinedColumnDef[]
}

/**
 * Gives `sortUndefined: false` to the leaf columns that sort with `styledDefault`, and to no other (DeepSeek's audit of
 * #340, round 1). The setting lets `undefined` reach the comparison so that it can put it last. A column with its own
 * `sortingFn` would then receive `undefined` in its own comparator, which was written for TanStack's handling and may not
 * expect it, so it keeps TanStack's default.
 *
 * A leaf gets it only when it sorts with `styledDefault` (neither it nor the app's `defaultColumn` names another
 * `sortingFn`) and neither it nor the app's `defaultColumn` sets `sortUndefined`. Group columns are walked into.
 */
export const resolveSortUndefinedDefaults = <TColumn extends SortUndefinedColumnDef>(
    columns: readonly TColumn[],
    defaultColumn?: SortUndefinedColumnDef,
): TColumn[] => {
    const appSortingFn = defaultColumn?.sortingFn
    const appSetsSortUndefined = defaultColumn?.sortUndefined !== undefined

    const resolve = (column: TColumn): TColumn => {
        if (column.columns?.length) {
            return { ...column, columns: column.columns.map((child) => resolve(child as TColumn)) }
        }

        const sortingFn = column.sortingFn ?? appSortingFn
        const usesStyledDefault = sortingFn === undefined || sortingFn === STYLED_DEFAULT_SORTING_FN

        if (!usesStyledDefault || column.sortUndefined !== undefined || appSetsSortUndefined) return column

        return { ...column, sortUndefined: false }
    }

    return columns.map(resolve)
}
