export type SortDirection = 'asc' | 'desc'

/** What a sortable header previews while it is hovered or keyboard-focused. */
export interface SortPreview {
    /** The way the previewed triangle points. */
    direction: SortDirection
    /** `true`: the primary colour, the header will be sorted this way. `false`: grey, the unsorted look. */
    primary: boolean
}

interface SortPreviewInput {
    /** `column.getIsSorted()`. */
    sorted: false | SortDirection
    /** `column.getFirstSortDir()`. */
    firstDirection: SortDirection
    /** `column.getNextSortingOrder()`: what a sort toggle does to this column; `false` removes it. */
    nextOrder: false | SortDirection
    /** Whether this column is the last entry of the sorting state (`sorting.at(-1)`). */
    isLastSortEntry: boolean
}

/**
 * What the header will look like right after a plain click (no Shift), for the hover and focus preview
 * (ASMA-8597, UX round 3, 2026-11-02). It mirrors `column.toggleSorting(undefined, false)` of TanStack Table 8.21,
 * which `getToggleSortingHandler` calls for a click:
 *
 * - A column that is not sorted previews the way its first click sorts, in grey: UX keeps the unsorted look
 *   (the click then sorts it that way, or replaces a sort on other columns by it).
 * - A sorted column that is **not the last** entry of the sorting takes the `'replace'` branch (a plain click on
 *   one column of a multi-sort drops the others): the whole sorting becomes this column alone with
 *   `desc: nextSortingOrder === 'desc'`. It is **never removed**, so a `false` next order (the removal) becomes
 *   ascending, in the primary colour.
 * - A sorted column that is the last (or only) entry takes the `'toggle'` branch: it flips to
 *   `getNextSortingOrder()`, or is removed when that is `false`, which previews as the grey first direction.
 *
 * Known limitation: with Shift held the click multi-sorts instead (`'add'` or `'toggle'` in place). The preview
 * still shows the plain click, because a key held while hovering is not tracked.
 */
export function getSortPreview({ sorted, firstDirection, nextOrder, isLastSortEntry }: SortPreviewInput): SortPreview {
    if (!sorted) return { direction: firstDirection, primary: false }

    if (!isLastSortEntry) return { direction: nextOrder === 'desc' ? 'desc' : 'asc', primary: true }

    if (nextOrder) return { direction: nextOrder, primary: true }

    return { direction: firstDirection, primary: false }
}
