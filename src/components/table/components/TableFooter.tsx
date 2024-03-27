import { type Table } from '@tanstack/react-table'
import { TablePagination } from './TablePagination'
import type { StyledTableProps } from '../types'
import './TableFooter.scss'

export function TableFooter<
    TData extends {
        id: string | number
    },
    TCustomData = Record<string, unknown>,
>({
    table,
    styledTableProps,
    tableId,
}: {
    table: Table<TData>
    styledTableProps: StyledTableProps<TData, TCustomData>
    tableId: string
}) {
    if (styledTableProps.hideFooter) return null

    return (
        <div className='table-footer'>
            {styledTableProps.footer?.(table)}
            <TablePagination
                table={table}
                locale={styledTableProps.locale || 'en'}
                tableId={tableId}
            />
        </div>
    )
}
