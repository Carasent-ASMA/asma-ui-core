import { type Table } from '@tanstack/react-table'
import { TablePagination } from './TablePagination'
import type { StyledTableProps } from '../types'
import style from '../StyledTable.module.scss'

export function TableFooter<
    TData extends {
        id: string | number
    },
    TCustomData = Record<string, unknown>,
>({ table, styledTableProps }: { table: Table<TData>; styledTableProps: StyledTableProps<TData, TCustomData> }) {
    if (styledTableProps.hideFooter) return null

    return (
        <div className={style['table-footer']}>
            {styledTableProps.footer?.(table)}
            <TablePagination table={table} locale={styledTableProps.locale || 'en'} />
        </div>
    )
}
