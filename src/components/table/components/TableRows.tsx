import { type Table } from '@tanstack/react-table'
import type { StyledTableProps } from '../types'
import { TableRow } from './TableRow'

export function TableRows<
    TData extends {
        id: string | number
    },
    TCustomData = Record<string, unknown>,
>({ styledTableProps, table }: { styledTableProps: StyledTableProps<TData, TCustomData>; table: Table<TData> }) {
    const rows = styledTableProps.hideFooter ? table.getCoreRowModel().rows : table.getRowModel().rows
    return (
        <>
            {rows.map((row, index) => (
                <TableRow key={row.id} styledTableProps={styledTableProps} row={row} index={index} />
            ))}
        </>
    )
}
