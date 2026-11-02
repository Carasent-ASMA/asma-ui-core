import {
    createTable,
    getCoreRowModel,
    type ColumnDef,
    type SortingState,
    type TableOptionsResolved,
    type Updater,
} from '@tanstack/react-table'
import { describe, expect, it } from 'vitest'
import { getSortPreview, type SortDirection } from './sortPreview'

/**
 * `getSortPreview` mirrors TanStack's `column.toggleSorting(undefined, false)`. These tests run the real thing on a
 * grid of sorting states and compare: the helper must say what a plain click then produces.
 */

interface Row {
    id: string
    a: string
    b: string
    c: string
}

type Sorting = { id: string; desc: boolean }[]

// Explicit first directions: with no rows TanStack cannot tell a text column from a number one and says descending.
const columns: ColumnDef<Row>[] = [
    { id: 'a', accessorKey: 'a', sortDescFirst: false },
    { id: 'b', accessorKey: 'b', sortDescFirst: true },
    { id: 'c', accessorKey: 'c', sortDescFirst: false },
]

const setup = (sorting: Sorting, enableSortingRemoval?: boolean) => {
    let result: SortingState = sorting
    const options: TableOptionsResolved<Row> = {
        columns,
        data: [],
        state: { sorting },
        onStateChange: () => undefined,
        onSortingChange: (updater: Updater<SortingState>) => {
            result = typeof updater === 'function' ? updater(sorting) : updater
        },
        renderFallbackValue: null,
        getCoreRowModel: getCoreRowModel(),
        ...(enableSortingRemoval === undefined ? {} : { enableSortingRemoval }),
    }
    const table = createTable<Row>(options)

    return { table, after: () => result }
}

/** The preview helper's input for a column, read from the table the way `TableHeaderCell` reads it. */
const previewOf = (sorting: Sorting, id: string, enableSortingRemoval?: boolean) => {
    const { table } = setup(sorting, enableSortingRemoval)
    const column = table.getColumn(id)!

    return getSortPreview({
        sorted: column.getIsSorted(),
        firstDirection: column.getFirstSortDir(),
        nextOrder: column.getNextSortingOrder(),
        isLastSortEntry: sorting[sorting.length - 1]?.id === id,
    })
}

const GRID: Sorting[] = []
const DIRECTIONS: SortDirection[] = ['asc', 'desc']

// Every sorting of up to three of the columns, each in either direction, in every order.
for (const first of ['a', 'b', 'c']) {
    for (const d1 of DIRECTIONS) {
        GRID.push([{ id: first, desc: d1 === 'desc' }])
        for (const second of ['a', 'b', 'c'].filter((id) => id !== first)) {
            for (const d2 of DIRECTIONS) {
                GRID.push([
                    { id: first, desc: d1 === 'desc' },
                    { id: second, desc: d2 === 'desc' },
                ])
                for (const third of ['a', 'b', 'c'].filter((id) => id !== first && id !== second)) {
                    for (const d3 of DIRECTIONS) {
                        GRID.push([
                            { id: first, desc: d1 === 'desc' },
                            { id: second, desc: d2 === 'desc' },
                            { id: third, desc: d3 === 'desc' },
                        ])
                    }
                }
            }
        }
    }
}
GRID.push([])

describe('getSortPreview', () => {
    it.each([true, false, undefined])(
        'agrees with a plain click of TanStack on every sorting of the grid (enableSortingRemoval: %s)',
        (enableSortingRemoval) => {
            let sortedCases = 0
            let replaceCases = 0

            for (const sorting of GRID) {
                for (const id of ['a', 'b', 'c']) {
                    const preview = previewOf(sorting, id, enableSortingRemoval)
                    const { table, after } = setup(sorting, enableSortingRemoval)
                    const column = table.getColumn(id)!

                    // A plain click, exactly as `getToggleSortingHandler` does it for a click without Shift.
                    column.toggleSorting(undefined, false)

                    const entry = after().find((sort) => sort.id === id)
                    const label = `sorting ${JSON.stringify(sorting)}, column ${id}, removal ${String(enableSortingRemoval)}`

                    if (!column.getIsSorted()) {
                        // UX keeps the unsorted look grey; the direction is the one the click sorts it in.
                        expect(preview.primary, label).toBe(false)
                        expect(entry, label).toEqual({ id, desc: preview.direction === 'desc' })
                        continue
                    }

                    sortedCases += 1

                    if (preview.primary) {
                        // The header will be sorted this way, in the primary colour.
                        expect(entry, label).toEqual({ id, desc: preview.direction === 'desc' })
                        if (sorting[sorting.length - 1]?.id !== id) {
                            replaceCases += 1
                            // A non-last column replaces the whole sorting: it is alone afterwards.
                            expect(after(), label).toEqual([{ id, desc: preview.direction === 'desc' }])
                        }
                    } else {
                        // Grey: the sort is removed, and the grey triangle points the way a first click sorts.
                        expect(entry, label).toBeUndefined()
                        expect(preview.direction, label).toBe(column.getFirstSortDir())
                    }
                }
            }

            // The grid is not vacuous: it has sorted columns, and many of them in the replace branch.
            expect(sortedCases).toBeGreaterThan(100)
            expect(replaceCases).toBeGreaterThan(40)
        },
    )

    it('previews the replacement, never the removal, for a sorted column that is not the last entry (the multi-sort case)', () => {
        // `b` sorts descending first and is ascending: a toggle would remove it. In `[b asc, c asc]` it is not the
        // last entry, so a plain click makes the sorting `[b asc]`: the preview is a primary ascending triangle.
        const sorting: Sorting = [
            { id: 'b', desc: false },
            { id: 'c', desc: false },
        ]

        expect(previewOf(sorting, 'b')).toEqual({ direction: 'asc', primary: true })
        // `c` is the last entry and sorts ascending first: it flips to descending in the primary colour.
        expect(previewOf(sorting, 'c')).toEqual({ direction: 'desc', primary: true })
        // In `[c asc, b asc]` `b` is the last entry: a toggle removes it, previewed as the grey first direction.
        expect(
            previewOf(
                [
                    { id: 'c', desc: false },
                    { id: 'b', desc: false },
                ],
                'b',
            ),
        ).toEqual({ direction: 'desc', primary: false })
    })

    it('never previews the removal when removal is off (enableSortingRemoval: false)', () => {
        for (const sorting of GRID) {
            for (const id of ['a', 'b', 'c']) {
                const preview = previewOf(sorting, id, false)
                const column = setup(sorting, false).table.getColumn(id)!

                // A sorted column always shows a primary preview, and it is the opposite direction.
                if (column.getIsSorted()) {
                    expect(preview.primary, `${JSON.stringify(sorting)} ${id}`).toBe(true)
                    if (sorting[sorting.length - 1]?.id === id) {
                        expect(preview.direction).toBe(column.getIsSorted() === 'asc' ? 'desc' : 'asc')
                    }
                }
            }
        }
    })
})
