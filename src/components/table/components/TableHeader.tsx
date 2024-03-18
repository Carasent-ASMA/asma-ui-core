import { flexRender, type Table } from '@tanstack/react-table'
import clsx from 'clsx'
import { last } from 'lodash-es'
import { DropDownIcon, DropUpIcon } from 'src/components/data-display/icons'
import { cn } from 'src/helpers/cn'
import type { StyledTableProps } from '../types'
import './TableHeader.scss'

export function TableHeader<
    TData extends {
        id: string | number
    },
    TCustomData = Record<string, unknown>,
>({ table, styledTableProps }: { table: Table<TData>; styledTableProps: StyledTableProps<TData, TCustomData> }) {
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
                        let columnWidth: number | string = header.getSize()

                        // setup size, if user predefined it in column builder
                        if (columnWidth) {
                            columnWidth = `${columnWidth}px`
                        }

                        // last column, except actions
                        const hasActionsColumn = last(header.headerGroup.headers)?.id === 'actions'
                        const lastUserColumn =
                            header.headerGroup.headers[header.headerGroup.headers.length - (hasActionsColumn ? 2 : 1)]
                        //  setup full width for last user created column
                        if (lastUserColumn?.id === header.id || !columnWidth) {
                            columnWidth = '100%'
                        }

                        return (
                            <th
                                key={header.id}
                                colSpan={header.colSpan}
                                className={cn(
                                    't-cell',
                                    // *
                                    //  sticky actions
                                    header.column.id === 'actions' && 't-cell__actions',
                                )}
                                style={{
                                    width: columnWidth || header.column.columnDef.size,
                                    maxWidth: columnWidth || header.column.columnDef.maxSize,
                                    minWidth: columnWidth || header.column.columnDef.minSize,
                                }}
                            >
                                <div
                                    className={cn(
                                        'flex items-center justify-left',
                                        hideHeader ? 'hide-table-header' : 'show-table-header',
                                        header.column.getCanSort() && 'sortable-column',
                                        header.column.columnDef.className,
                                    )}
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {{
                                        asc: <DropUpIcon className='sort-icon' />,
                                        desc: <DropDownIcon className='sort-icon' />,
                                    }[header.column.getIsSorted() as string] ?? null}
                                </div>
                            </th>
                        )
                    })}
                </tr>
            ))}
        </thead>
    )
}
