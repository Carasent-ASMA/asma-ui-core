import { createTable, getCoreRowModel, type ColumnDef, type TableOptionsResolved } from '@tanstack/react-table'
import { describe, expect, it } from 'vitest'
import { hasFixedWidth, resolveColumnSizingDefaults } from './columnSizingDefaults'

/**
 * The default widths of the columns (ASMA-8597, UX round 4, P2e): D16's +20 px for sortable columns, DEC-NARROW's
 * minimum, DEC-D16-OPTOUTS, and what is left alone. The resolver is checked on its own and against a real TanStack table,
 * which is what applies the widths: `column.getSize()` clamps `size` between `minSize` and `maxSize`.
 */

interface Row {
    id: string
    name: string
}

const resolve = (
    columns: ColumnDef<Row>[],
    options: { defaultColumn?: Partial<ColumnDef<Row>>; enableSorting?: boolean; canResize?: boolean } = {},
): ColumnDef<Row>[] => resolveColumnSizingDefaults(columns, { canResize: true, ...options })

/** TanStack's width of each column, as a real table gives it. */
const widths = (columns: ColumnDef<Row>[], tableOptions: Partial<TableOptionsResolved<Row>> = {}): Record<string, number> => {
    const table = createTable<Row>({
        columns,
        data: [],
        state: { columnSizing: {} },
        onStateChange: () => undefined,
        renderFallbackValue: null,
        getCoreRowModel: getCoreRowModel(),
        ...tableOptions,
    })

    return Object.fromEntries(table.getAllLeafColumns().map((column) => [column.id, column.getSize()]))
}

const only = (def: ColumnDef<Row>, options?: Parameters<typeof resolve>[1]): ColumnDef<Row> => resolve([def], options)[0]!

describe('D16: +20 px for a sortable data column', () => {
    it('U-R06: a column with a size gets 20 more; one without gets 150 + 20, or the defaultColumn size + 20', () => {
        expect(only({ id: 'a', accessorKey: 'name', size: 120 }).size).toBe(140)
        expect(only({ id: 'a', accessorKey: 'name' }).size).toBe(170)
        expect(only({ id: 'a', accessorKey: 'name' }, { defaultColumn: { size: 200 } }).size).toBe(220)
        // The column's own size beats the table's defaultColumn size.
        expect(only({ id: 'a', accessorKey: 'name', size: 90 }, { defaultColumn: { size: 200 } }).size).toBe(110)
    })

    it('U-R06: minSize and maxSize grow by 20 when the column or the defaultColumn sets them, and not when nothing does', () => {
        const withBoth = only({ id: 'a', accessorKey: 'name', size: 120, minSize: 80, maxSize: 300 })

        expect([withBoth.size, withBoth.minSize, withBoth.maxSize]).toEqual([140, 100, 320])

        const inherited = only({ id: 'a', accessorKey: 'name' }, { defaultColumn: { minSize: 50, maxSize: 400 } })

        expect([inherited.minSize, inherited.maxSize]).toEqual([70, 420])
        // No maxSize anywhere: none is invented.
        expect(only({ id: 'a', accessorKey: 'name', size: 120 }).maxSize).toBeUndefined()
    })

    it('U-R07: a column that cannot sort, an internal column and a group header stay as they are', () => {
        for (const def of [
            { id: 'a', accessorKey: 'name', size: 120, enableSorting: false },
            { id: 'a', size: 120 },
        ] as ColumnDef<Row>[]) {
            expect(only(def).size).toBe(120)
        }

        // The table's `enableSorting={false}` makes every column non-sortable.
        expect(only({ id: 'a', accessorKey: 'name', size: 120 }, { enableSorting: false }).size).toBe(120)
        // ui-core's own columns, even with an accessor and sorting on.
        for (const id of ['select', 'expand-column-id', 'actions', 'dnd-handle', 'show-full-text']) {
            expect(only({ id, accessorFn: (row: Row) => row.name, size: 50, minSize: 50, maxSize: 50 }).size).toBe(50)
        }

        const [group] = resolve([
            {
                id: 'group',
                header: 'Group',
                columns: [
                    { id: 'a', accessorKey: 'name', size: 120 },
                    { id: 'b', size: 90 },
                ],
            },
        ])

        expect(group).not.toHaveProperty('size')
        expect((group as { columns?: ColumnDef<Row>[] }).columns?.map((child) => child.size)).toEqual([140, 90])
    })

    it('DEC-D16-OPTOUTS (U-R04, U-R07): a sortable opt-out grows and stays fixed; a non-sortable one keeps its width', () => {
        // The calendar's `unread-badge`: 10/10/10, `enableResizing: false`, an accessor, sorting not disabled.
        const badge = only({ id: 'unread-badge', accessorFn: (row: Row) => row.name, size: 10, minSize: 10, maxSize: 10, enableResizing: false })

        expect([badge.size, badge.minSize, badge.maxSize]).toEqual([30, 30, 30])
        expect(hasFixedWidth(badge)).toBe(true)

        // crm's `isPrimary`: 70/70/70.
        expect(only({ id: 'isPrimary', accessorKey: 'name', size: 70, minSize: 70, maxSize: 70, enableResizing: false }).size).toBe(90)
        // The care receiver bar's drag column: 78/78/78, no accessor, so it cannot sort and stays.
        const drag = only({ id: 'drag', size: 78, minSize: 78, maxSize: 78 })

        expect([drag.size, drag.minSize, drag.maxSize]).toEqual([78, 78, 78])
        // A non-sortable opt-out keeps its width.
        expect(only({ id: 'status', accessorKey: 'name', enableSorting: false, enableResizing: false, size: 60 }).size).toBe(60)
    })
})

describe('DEC-NARROW: the minimum of a resizable column', () => {
    it('U-R05: a column with no minSize gets the smaller of 100 and its default width; one with no size keeps 100', () => {
        const nonSortable = only({ id: 'a', enableSorting: false, size: 60 })
        const sortable = only({ id: 'b', accessorKey: 'name', size: 60 })
        const wide = only({ id: 'c', accessorKey: 'name', size: 300 })
        const noSize = only({ id: 'd', enableSorting: false })
        const noSizeSortable = only({ id: 'e', accessorKey: 'name' })

        expect(nonSortable.minSize).toBe(60)
        // Sortable: 60 + 20 = 80, and the minimum is that, not 100 and not 100 + 20.
        expect([sortable.size, sortable.minSize]).toEqual([80, 80])
        expect(wide.minSize).toBe(100)
        expect(noSize.minSize).toBe(100)
        // 170 after D16, and ui-core's own 100 does not grow.
        expect([noSizeSortable.size, noSizeSortable.minSize]).toEqual([170, 100])
    })

    it('U-R05: a column with its own minSize keeps it, plus 20 if sortable, whether or not it opts out of resizing', () => {
        expect(only({ id: 'a', enableSorting: false, size: 60, minSize: 40 }).minSize).toBe(40)
        expect(only({ id: 'a', accessorKey: 'name', size: 60, minSize: 40 }).minSize).toBe(60)
        expect(only({ id: 'a', accessorKey: 'name', size: 60, minSize: 40, enableResizing: false }).minSize).toBe(60)
    })

    it("U-R05: the table's defaultColumn size counts as the column's size; ui-core's own columns keep the full 100 px", () => {
        expect(only({ id: 'a', enableSorting: false }, { defaultColumn: { size: 70 } }).minSize).toBe(70)
        expect(only({ id: 'actions', size: 50 }).minSize).toBe(100)
    })

    it('with resizing off no minimum is added, but D16 still applies', () => {
        const column = only({ id: 'a', accessorKey: 'name', size: 60 }, { canResize: false })

        expect(column.size).toBe(80)
        expect(column.minSize).toBeUndefined()
        expect(only({ id: 'b', enableSorting: false, size: 60 }, { canResize: false }).minSize).toBeUndefined()
    })
})

describe('what TanStack renders (the resolver against a real table)', () => {
    it('gives the +20 and the narrow minimum as widths, and ui-core never widens a column past its default', () => {
        const columns = resolve([
            { id: 'sortable', accessorKey: 'name', size: 120 },
            { id: 'plain', enableSorting: false, size: 120 },
            { id: 'narrow', enableSorting: false, size: 60 },
            { id: 'narrowSortable', accessorKey: 'name', size: 60 },
            { id: 'none', accessorKey: 'name' },
            { id: 'fixed', accessorKey: 'name', size: 50, minSize: 50, maxSize: 50, enableResizing: false },
        ])

        expect(widths(columns)).toEqual({ sortable: 140, plain: 120, narrow: 60, narrowSortable: 80, none: 170, fixed: 70 })
    })

    it('U-R10 (DEC-D16): a saved or app-given width is applied as given, with no +20, and clamped by the new minimum', () => {
        const columns = resolve([
            { id: 'sortable', accessorKey: 'name', size: 120 },
            { id: 'small', accessorKey: 'name', size: 120 },
        ])

        expect(widths(columns, { state: { columnSizing: { sortable: 300, small: 30 } } })).toEqual({ sortable: 300, small: 100 })
    })
})

describe('hasFixedWidth', () => {
    it('is true only for a maxSize equal to the minSize (OQ-15)', () => {
        expect(hasFixedWidth({ minSize: 78, maxSize: 78 })).toBe(true)
        expect(hasFixedWidth({ minSize: 78, maxSize: 200 })).toBe(false)
        expect(hasFixedWidth({ minSize: 100 })).toBe(false)
        expect(hasFixedWidth({})).toBe(false)
    })
})
