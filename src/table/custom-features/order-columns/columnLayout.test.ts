import { createTable, getCoreRowModel, type ColumnDef, type TableState } from '@tanstack/react-table'
import { describe, expect, it } from 'vitest'
import {
    getDefinitionColumnOrder,
    hasChangedColumnLayout,
    hasHiddenColumns,
    hasReorderedColumns,
    isDefaultColumnOrder,
} from './columnLayout'

interface Row {
    id: string
    a: string
    b: string
    c: string
}

const columns: ColumnDef<Row, unknown>[] = [
    { accessorKey: 'a', header: 'A' },
    { accessorKey: 'b', header: 'B' },
    { accessorKey: 'c', header: 'C', enableHiding: false },
    { id: 'select', header: 'Select' },
]

const isColumnA = (column: ColumnDef<Row, unknown>): boolean =>
    'accessorKey' in column && column.accessorKey === 'a'

const makeTable = (defs: ColumnDef<Row, unknown>[], state: Partial<TableState> = {}) => {
    const table = createTable<Row>({
        columns: defs,
        data: [],
        getCoreRowModel: getCoreRowModel(),
        onStateChange: () => undefined,
        renderFallbackValue: null,
        state: {},
    })

    table.setOptions((previous) => ({ ...previous, state: { ...table.initialState, ...state } }))

    return table
}

describe('column layout (ASMA-8597, the dot on the column settings pin)', () => {
    it('U-D01: false for the default order with nothing hidden', () => {
        const table = makeTable(columns)

        expect(hasHiddenColumns(table)).toBe(false)
        expect(hasReorderedColumns(table)).toBe(false)
        expect(hasChangedColumnLayout(table)).toBe(false)
        expect(isDefaultColumnOrder(table)).toBe(true)
    })

    it('U-D02: true for a hidden hideable column; false for a non-hideable or internal one', () => {
        expect(hasChangedColumnLayout(makeTable(columns, { columnVisibility: { b: false } }))).toBe(true)
        // `c` has enableHiding: false, and `select` is an internal column.
        expect(hasChangedColumnLayout(makeTable(columns, { columnVisibility: { c: false } }))).toBe(false)
        expect(hasChangedColumnLayout(makeTable(columns, { columnVisibility: { select: false } }))).toBe(false)
    })

    it('U-D03: true for a reordered popover column; false after moving it back', () => {
        const moved = makeTable(columns, { columnOrder: ['b', 'a', 'c', 'select'] })

        expect(hasReorderedColumns(moved)).toBe(true)
        expect(hasChangedColumnLayout(moved)).toBe(true)
        expect(isDefaultColumnOrder(moved)).toBe(false)

        const back = makeTable(columns, { columnOrder: ['a', 'b', 'c', 'select'] })

        expect(hasReorderedColumns(back)).toBe(false)
        expect(isDefaultColumnOrder(back)).toBe(true)
        expect(hasReorderedColumns(makeTable(columns, { columnOrder: [] }))).toBe(false)
    })

    it('moving an internal column alone is not a layout change the popover can show', () => {
        expect(hasReorderedColumns(makeTable(columns, { columnOrder: ['select', 'a', 'b', 'c'] }))).toBe(false)
    })

    it('U-D04: uses the live default: after the columns change, a stored order that now matches shows no dot', () => {
        const stored = ['b', 'a', 'c', 'select']

        expect(hasReorderedColumns(makeTable(columns, { columnOrder: stored }))).toBe(true)

        // Column `a` is gone from the definitions. The stored order lists `a`, which no longer exists.
        const withoutA = columns.filter((column) => !isColumnA(column))
        const table = makeTable(withoutA, { columnOrder: stored })

        expect(getDefinitionColumnOrder(table)).toEqual(['b', 'c', 'select'])
        expect(hasReorderedColumns(table)).toBe(false)
        expect(isDefaultColumnOrder(table)).toBe(true)
    })

    it('U-D04: follows the columns of the same table when they change, instead of a list taken at creation', () => {
        const table = makeTable(columns, { columnOrder: ['b', 'a', 'c', 'select'] })

        expect(getDefinitionColumnOrder(table)).toEqual(['a', 'b', 'c', 'select'])
        expect(hasReorderedColumns(table)).toBe(true)

        table.setOptions((previous) => ({
            ...previous,
            columns: columns.filter((column) => !isColumnA(column)),
        }))

        expect(getDefinitionColumnOrder(table)).toEqual(['b', 'c', 'select'])
        expect(hasReorderedColumns(table)).toBe(false)
        expect(isDefaultColumnOrder(table)).toBe(true)
    })

    it('reads group columns in definition order', () => {
        const grouped: ColumnDef<Row, unknown>[] = [
            { accessorKey: 'a', header: 'A' },
            {
                header: 'Group',
                columns: [
                    { accessorKey: 'b', header: 'B' },
                    { accessorKey: 'c', header: 'C' },
                ],
            },
        ]

        expect(getDefinitionColumnOrder(makeTable(grouped, { columnOrder: ['c', 'b', 'a'] }))).toEqual(['a', 'b', 'c'])
    })
})
