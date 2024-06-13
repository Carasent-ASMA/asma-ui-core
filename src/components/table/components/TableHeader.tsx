import { type Table } from '@tanstack/react-table'
import clsx from 'clsx'
import type { StyledTableProps } from '../types'
import { TableHeaderCell } from './TableHeaderCell'
import './TableHeader.scss'

export function TableHeader<
    TData extends {
        id: string | number
    },
    TCustomData = Record<string, unknown>,
>({
    table,
    styledTableProps,
    tableCanResize,
}: {
    table: Table<TData>
    styledTableProps: StyledTableProps<TData, TCustomData>
    tableCanResize: boolean
}) {
    const { stickyHeader = false, hideHeader = false } = styledTableProps

    if (styledTableProps.loading) return null

    return (
        <thead
            className={clsx('table-header', hideHeader && 'hide-table-header')}
            style={
                (stickyHeader && {
                    position: 'sticky',
                    top: -0.2,
                }) ||
                {}
            }
        >
            {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                        return (
                            <TableHeaderCell
                                key={header.column.id}
                                styledTableProps={styledTableProps}
                                header={header}
                                tableCanResize={tableCanResize}
                            />
                        )
                    })}
                </tr>
            ))}
        </thead>
    )
}
