import { flexRender, type Header } from '@tanstack/react-table'
import { getTableHeaderStyle } from '../helpers/getTableHeaderStyle'
import type { StyledTableProps } from '../types'
import { useRef } from 'react'
import clsx from 'clsx'
import { DropDownIcon, DropUpIcon } from 'src/components/icons'

export function TableHeaderCell<
    TData extends {
        id: string | number
    },
    TCustomData = Record<string, unknown>,
>({
    styledTableProps,
    header,
    tableCanResize = false,
}: {
    styledTableProps: StyledTableProps<TData, TCustomData>
    header: Header<TData, unknown>
    tableCanResize: boolean
}) {
    const { hideHeader = false, enableResizing = false } = styledTableProps

    const ref = useRef<HTMLTableCellElement | null>(null)

    return (
        <th
            ref={ref}
            key={header.id}
            colSpan={header.colSpan}
            className={clsx(
                't-cell',
                // *
                //  sticky actions
                header.column.id === 'actions' && 't-cell__actions',
            )}
            style={getTableHeaderStyle({ enableResizing, header, element: ref.current })}
        >
            <div
                className={clsx(
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
                {tableCanResize && header.column.getCanResize() && (
                    <div
                        {...{
                            onDoubleClick: () => header.column.resetSize(),
                            onMouseDown: header.getResizeHandler(),
                            onTouchStart: header.getResizeHandler(),
                            className: `resizer ${header.column.getIsResizing() ? 'isResizing' : ''}`,
                        }}
                    />
                )}
            </div>
        </th>
    )
}
