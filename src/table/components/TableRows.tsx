import type { Table } from '@tanstack/react-table'
import type { StyledTableProps } from '../types'
import { TableRow } from './TableRow'
import type { ColumnWindow } from 'src/table/hooks/useColumnVirtualizer'

export function TableRows<
    TData extends {
        id: string | number
    },
    TCustomData = Record<string, unknown>,
>({
    styledTableProps,
    table,
    columnWindow,
}: {
    styledTableProps: StyledTableProps<TData, TCustomData>
    table: Table<TData>
    columnWindow: ColumnWindow
}) {
    const rows = styledTableProps.hideFooter ? table.getExpandedRowModel().rows : table.getRowModel().rows

    return (
        <>
            {rows.map((row, index) => {
                return (
                    <TableRow
                        key={row.id}
                        styledTableProps={styledTableProps}
                        row={row}
                        index={index}
                        columnWindow={columnWindow}
                    />
                )
            })}
        </>
    )
}
