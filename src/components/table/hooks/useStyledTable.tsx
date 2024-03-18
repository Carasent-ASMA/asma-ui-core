import {
    useReactTable,
    type Row,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
} from '@tanstack/react-table'
import { SELECT_COLUMN_ID, type StyledTableProps } from '../types'

export const useStyledTable = <
    TData extends {
        id: string | number
    },
    TCustomData = Record<string, unknown>,
>(
    props: StyledTableProps<TData, TCustomData>,
) => {
    const { columns, data, initialState, pageSize, enableRowSelection, tableInstanceRef, ...rest } = props
    const table = useReactTable({
        ...rest,
        columns,
        data,
        initialState: {
            pagination: { pageIndex: 0, pageSize: pageSize || 50 },
            columnVisibility: {
                ...initialState?.columnVisibility,
                [SELECT_COLUMN_ID]: false,
            },
            ...initialState,
        },
        enableRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getRowId:
            rest.getRowId ||
            ((row: TData, _index: number, parent?: Row<TData>) =>
                parent ? [parent.id, row.id].join('.') : row.id.toString()),
    })

    if (tableInstanceRef) {
        tableInstanceRef.current = table
    }

    return { table }
}
