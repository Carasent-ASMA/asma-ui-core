import { type Table } from '@tanstack/react-table'
import { TablePagination } from './TablePagination'
import type { StyledTableProps } from '../types'

export function TableFooter<
    TData extends {
        id: string | number
    },
    TCustomData = Record<string, unknown>,
>({ table, styledTableProps }: { table: Table<TData>; styledTableProps: StyledTableProps<TData, TCustomData> }) {
    if (styledTableProps.hideFooter) return null

    return (
        <div className='w-full gap-2 bg-transparent flex flex-row py-1 my-1 items-center justify-end '>
            {styledTableProps.footer?.(table)}
            <TablePagination table={table} locale={styledTableProps.locale || 'en'} />
        </div>
    )
}
