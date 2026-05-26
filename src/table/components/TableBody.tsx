import type { Table } from '@tanstack/react-table'
import type { StyledTableProps } from '../types'
import { TableSkeleton } from './TableSkeleton'
import { TableRows } from './TableRows'
import style from './StyledTable.module.scss'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { ColumnWindow } from 'src/table/hooks/useColumnVirtualizer'

export function TableBody<
    TData extends {
        id: string | number
    },
    TCustomData = Record<string, unknown>,
>({
    table,
    styledTableProps,
    columnWindow,
}: {
    table: Table<TData>
    styledTableProps: StyledTableProps<TData, TCustomData>
    columnWindow: ColumnWindow
}): JSX.Element | null {
    const { columns, data, loading, enableDnd, rowHeight } = styledTableProps
    const colSpan = table.getAllLeafColumns().length || columns.length || 1

    if (loading && data.length === 0) {
        return (
            <tbody className={style['tbody']}>
                <TableSkeleton colSpan={colSpan} rowHeight={rowHeight} />
            </tbody>
        )
    }

    if (data.length === 0) {
        return null
    }

    return (
        <tbody className={style['tbody']}>
            {enableDnd ? (
                <SortableContext items={data} strategy={verticalListSortingStrategy}>
                    <TableRows table={table} styledTableProps={styledTableProps} columnWindow={columnWindow} />
                </SortableContext>
            ) : (
                <TableRows table={table} styledTableProps={styledTableProps} columnWindow={columnWindow} />
            )}
        </tbody>
    )
}
