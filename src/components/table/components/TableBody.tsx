import { type Table } from '@tanstack/react-table'
import type { StyledTableProps } from '../types'
import { LoadingIcon } from 'src/components/icons'
import { TableSkeleton } from './TableSkeleton'
import { TableRows } from './TableRows'
import { TableNoRowsOverlay } from './TableNoRowsOverlay'
import style from '../StyledTable.module.scss'

export function TableBody<
    TData extends {
        id: string | number
    },
    TCustomData = Record<string, unknown>,
>({ table, styledTableProps }: { table: Table<TData>; styledTableProps: StyledTableProps<TData, TCustomData> }) {
    const { columns, data, loading, noRowsOverlay } = styledTableProps

    return (
        <tbody className={style['tbody']}>
            {!!(data.length > 0) && loading && <LoadingIcon className={style['loading-icon']} width={50} height={50} />}

            {data.length === 0 && loading ? (
                <TableSkeleton colSpan={columns.length} />
            ) : data.length > 0 ? (
                <TableRows table={table} styledTableProps={styledTableProps} />
            ) : (
                <TableNoRowsOverlay colSpan={columns.length} noRowsOverlay={noRowsOverlay} />
            )}
        </tbody>
    )
}
