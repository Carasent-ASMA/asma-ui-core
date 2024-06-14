import { flexRender, type Header } from '@tanstack/react-table'
import { getTableHeaderStyle } from '../helpers/getTableHeaderStyle'
import { ACTIONS_COLUMN_ID, EXPAND_COLUMN_ID, SELECT_COLUMN_ID, type StyledTableProps } from '../types'
import { useRef } from 'react'
import clsx from 'clsx'
import { DropDownIcon, DropUpIcon } from 'src/components/icons'
import style from '../StyledTable.module.scss'

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
                style['t-cell'],
                // *
                //  sticky actions
                header.column.id === 'actions' && style['t-cell__actions'],
            )}
            style={getTableHeaderStyle({ enableResizing, header, element: ref.current })}
        >
            <div
                className={clsx(
                    'flex items-center justify-left',
                    hideHeader ? style['hide-table-header'] : style['show-table-header'],
                    header.column.getCanSort() && style['sortable-column'],
                    header.column.columnDef.className,
                )}
                onClick={header.column.getToggleSortingHandler()}
            >
                {flexRender(header.column.columnDef.header, header.getContext())}
                {{
                    asc: <DropUpIcon className={style['sort-icon']} />,
                    desc: <DropDownIcon className={style['sort-icon']} />,
                }[header.column.getIsSorted() as string] ?? null}
                {tableCanResize &&
                    header.column.getCanResize() &&
                    ![SELECT_COLUMN_ID, EXPAND_COLUMN_ID, ACTIONS_COLUMN_ID].includes(header.column.id) && (
                        <div
                            {...{
                                onDoubleClick: () => header.column.resetSize(),
                                onMouseDown: header.getResizeHandler(),
                                onTouchStart: header.getResizeHandler(),
                                className: `${style['resizer']} ${
                                    header.column.getIsResizing() ? style['isResizing'] : ''
                                }`,
                            }}
                        />
                    )}
            </div>
        </th>
    )
}
