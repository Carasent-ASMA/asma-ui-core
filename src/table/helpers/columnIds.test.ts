import { createTable, getCoreRowModel, type ColumnDef, type TableState } from '@tanstack/react-table'
import { describe, expect, it } from 'vitest'
import { getLeafColumnInfos, type ColumnDefLike, type ColumnResolutionOptions } from './columnIds'

interface Row {
    id: string
    name: string
    owner: { name: string }
}

const makeTable = (columns: ColumnDef<Row, any>[], options: ColumnResolutionOptions = {}) => {
    const table = createTable<Row>({
        columns,
        data: [],
        getCoreRowModel: getCoreRowModel(),
        onStateChange: () => undefined,
        renderFallbackValue: null,
        state: {} as TableState,
        ...options,
    } as never)

    table.setOptions((previous) => ({ ...previous, state: { ...table.initialState } }))

    return table
}

const fromTable = (columns: ColumnDef<Row, any>[], options: ColumnResolutionOptions = {}) =>
    makeTable(columns, options)
        .getAllLeafColumns()
        .map((column) => ({
            id: column.id,
            canSort: column.getCanSort(),
            canMultiSort: column.getCanMultiSort(),
        }))

describe('getLeafColumnInfos (ASMA-8597)', () => {
    it('U-I01: ids and sortability equal a real TanStack table for id, dotted accessorKey, string header and groups', () => {
        const columns: ColumnDef<Row, any>[] = [
            { id: 'explicit', accessorKey: 'name', header: 'Explicit' },
            { accessorKey: 'owner.name', header: 'Owner' },
            { id: 'computed', accessorFn: (row) => row.name.length, header: () => null },
            { header: 'Only a header' },
            { accessorKey: 'name', header: 'Same key', enableSorting: false },
            { accessorKey: 'id', header: 'Single', enableMultiSort: false },
            {
                header: 'Group',
                columns: [
                    { accessorKey: 'name', header: 'Inside group' },
                    { id: 'nested', header: 'Nested without accessor' },
                ],
            },
        ]

        expect(getLeafColumnInfos(columns as ColumnDefLike[])).toEqual(fromTable(columns))
        expect(getLeafColumnInfos(columns as ColumnDefLike[]).map((column) => column.id)).toEqual([
            'explicit',
            'owner_name',
            'computed',
            'Only a header',
            'name',
            'id',
            'name',
            'nested',
        ])
    })

    it('follows the table options and defaultColumn like TanStack does', () => {
        const columns: ColumnDef<Row, any>[] = [
            { accessorKey: 'name', header: 'Name' },
            { accessorKey: 'id', header: 'Id', enableSorting: true, enableMultiSort: true },
        ]
        const cases: ColumnResolutionOptions[] = [
            { enableSorting: false },
            { enableMultiSort: false },
            { defaultColumn: { enableSorting: false } },
            { defaultColumn: { enableMultiSort: false } },
            { enableSorting: false, defaultColumn: { enableSorting: true } },
        ]

        for (const options of cases) {
            expect(getLeafColumnInfos(columns as ColumnDefLike[], options), JSON.stringify(options)).toEqual(
                fromTable(columns, options),
            )
        }
    })

    it('skips a column without any usable id instead of throwing', () => {
        expect(getLeafColumnInfos([{ header: () => null }, { id: 'ok', accessorKey: 'name' }])).toEqual([
            { id: 'ok', canSort: true, canMultiSort: true },
        ])
    })
})
