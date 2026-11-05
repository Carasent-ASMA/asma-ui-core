import { createTable, getCoreRowModel, type ColumnDef, type TableState } from '@tanstack/react-table'
import { describe, expect, it } from 'vitest'
import {
    columnVisibilitySignature,
    diffColumnVisibility,
    effectiveColumnOrder,
    getDefinitionColumnOrder,
    hasChangedColumnLayout,
    hasHiddenColumns,
    hasReorderedColumns,
    insertMissingColumns,
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

describe('column layout against the table\'s defaults (ASMA-8695, Q10)', () => {
    const withDefaults = (
        state: Partial<TableState>,
        defaults: { order: string[]; visibility: Record<string, boolean> } | undefined,
    ) => {
        const table = makeTable(columns, state)

        table.columnLayoutDefaults = defaults

        return table
    }

    it('U-L01: with defaults, a column hidden by default is no change; showing it, or hiding a default-visible one, is', () => {
        const defaults = { order: [], visibility: { b: false } }

        expect(hasChangedColumnLayout(withDefaults({ columnVisibility: { b: false } }, defaults))).toBe(false)
        expect(hasHiddenColumns(withDefaults({ columnVisibility: { b: true } }, defaults))).toBe(true)
        expect(hasHiddenColumns(withDefaults({ columnVisibility: { a: false, b: false } }, defaults))).toBe(true)
        expect(hasHiddenColumns(withDefaults({ columnVisibility: { b: false, a: true } }, defaults))).toBe(false)
    })

    it('U-L02: without defaults, any hidden column the user may hide is a change, as before ASMA-8695', () => {
        expect(hasHiddenColumns(withDefaults({ columnVisibility: { b: false } }, undefined))).toBe(true)
        expect(hasHiddenColumns(withDefaults({ columnVisibility: {} }, undefined))).toBe(false)
    })

    it('U-L03: a column that cannot hide, and an internal column, never count, with or without defaults', () => {
        const defaults = { order: [], visibility: {} }

        expect(hasHiddenColumns(withDefaults({ columnVisibility: { c: false, select: false } }, defaults))).toBe(false)
        expect(hasHiddenColumns(withDefaults({ columnVisibility: { c: false, select: false } }, undefined))).toBe(false)
    })

    it('U-L04: with defaults, the default order is the app\'s order, and the definition order is the change', () => {
        const defaults = { order: ['b', 'a', 'c', 'select'], visibility: {} }

        expect(hasReorderedColumns(withDefaults({ columnOrder: ['b', 'a', 'c', 'select'] }, defaults))).toBe(false)
        expect(hasReorderedColumns(withDefaults({ columnOrder: [] }, defaults))).toBe(true)
        expect(hasReorderedColumns(withDefaults({ columnOrder: ['a', 'b', 'c', 'select'] }, defaults))).toBe(true)
        // Without defaults the default is the definition order, as before.
        expect(hasReorderedColumns(withDefaults({ columnOrder: ['b', 'a', 'c', 'select'] }, undefined))).toBe(true)
    })
})

describe('effectiveColumnOrder, insertMissingColumns and the visibility difference (ASMA-8695)', () => {
    const definition = ['a', 'b', 'c', 'd']

    it('U-L05: the effective order lists the saved ids that exist first, then the rest in definition order', () => {
        expect(effectiveColumnOrder([], definition)).toEqual(definition)
        expect(effectiveColumnOrder(['c', 'a'], definition)).toEqual(['c', 'a', 'b', 'd'])
        expect(effectiveColumnOrder(['ghost', 'c', 'c'], definition)).toEqual(['c', 'a', 'b', 'd'])
        expect(effectiveColumnOrder(definition, definition)).toEqual(effectiveColumnOrder([], definition))
    })

    it('U-L06: DEC-03, a missing column goes right after the closest earlier column of the definition that the order lists', () => {
        // `x` sits between `b` and `c` in the definition.
        expect(insertMissingColumns(['c', 'a', 'b', 'd'], ['a', 'b', 'x', 'c', 'd'])).toEqual(['c', 'a', 'b', 'x', 'd'])
        // Nothing before it is listed: right before the closest later one.
        expect(insertMissingColumns(['c', 'd'], ['x', 'c', 'd'])).toEqual(['x', 'c', 'd'])
        // Several missing columns, in definition order.
        expect(insertMissingColumns(['d', 'a'], ['a', 'x', 'y', 'd'])).toEqual(['d', 'a', 'x', 'y'])
        // Nothing listed at all: at the end.
        expect(insertMissingColumns(['ghost'], ['a', 'b'])).toEqual(['ghost', 'a', 'b'])
    })

    it('U-L07: ids that no column has are kept, and a complete order is left as it is', () => {
        expect(insertMissingColumns(['ghost', 'b', 'a'], ['a', 'b'])).toEqual(['ghost', 'b', 'a'])
        expect(insertMissingColumns([], ['a', 'b'])).toEqual(['a', 'b'])
    })

    it('U-L08: the visibility difference keeps only what differs from the default, never an internal column', () => {
        expect(diffColumnVisibility({ a: false, b: true, select: true }, { select: false })).toEqual({ a: false })
        expect(diffColumnVisibility({ a: true, b: false }, { b: false })).toEqual({})
        expect(diffColumnVisibility({ a: true }, { a: false })).toEqual({ a: true })
        expect(diffColumnVisibility({}, { a: false })).toEqual({})
    })

    it('U-L09: the same differences in any key order are the same visibility', () => {
        expect(columnVisibilitySignature({ a: false, b: false }, {})).toBe(columnVisibilitySignature({ b: false, a: false }, {}))
        expect(columnVisibilitySignature({ a: false }, { a: false })).toBe(columnVisibilitySignature({}, {}))
        expect(columnVisibilitySignature({ a: false }, {})).not.toBe(columnVisibilitySignature({}, {}))
    })
})
