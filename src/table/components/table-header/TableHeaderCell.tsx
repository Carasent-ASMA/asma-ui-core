import { flexRender, type Header } from '@tanstack/react-table'
import { useMemo } from 'react'
import clsx from 'clsx'
import style from '../StyledTable.module.scss'
import { DropUpIcon } from 'src/table/shared-components/DropUpIcon'
import { DropDownIcon } from 'src/table/shared-components/DropDownIcon'
import { ACTIONS_COLUMN_ID, INTERNAL_COLUMN_IDS, type StyledTableProps } from 'src/table/types'
import { getTableHeaderStyle } from 'src/table/helpers/getTableHeaderStyle'
import { useRootContext } from 'src/table/context/RootContext'

export function TableHeaderCell<
    TData extends {
        id: string | number
    },
    TCustomData = Record<string, unknown>,
>({
    styledTableProps,
    header,
    tableCanResize = false,
    left,
    right,
    tableWidth,
}: {
    styledTableProps: StyledTableProps<TData, TCustomData>
    header: Header<TData, unknown>
    tableCanResize: boolean
    left: number
    right?: number
    tableWidth: number | null
}): JSX.Element {
    const { hideHeader = false, enableResizing = false } = styledTableProps
    const { isResizing, enableResizingFlag, disableResizingFlag } = useRootContext()

    const isFixed = header.column.columnDef.fixedLeft
    const isFixedRight = Boolean(header.column.columnDef.fixedRight)
    const isActionsColumn = header.column.id === ACTIONS_COLUMN_ID

    const hasActionsColumn = useMemo(
        () => header.headerGroup.headers.some((hdr) => hdr.id === ACTIONS_COLUMN_ID),
        [header.headerGroup.headers],
    )
    const hasFixedRightColumns = useMemo(
        () => header.headerGroup.headers.some((hdr) => Boolean(hdr.column.columnDef.fixedRight)),
        [header.headerGroup.headers],
    )
    const lastColumn = useMemo(
        () => header.headerGroup.headers[header.headerGroup.headers.length - (hasActionsColumn ? 2 : 1)],
        [header.headerGroup.headers, hasActionsColumn],
    )

    const canSort = header.column.getCanSort()
    const sortedDirection = header.column.getIsSorted()
    const ariaSort = canSort
        ? sortedDirection === 'asc'
            ? 'ascending'
            : sortedDirection === 'desc'
              ? 'descending'
              : 'none'
        : undefined

    return (
        <th
            key={header.id}
            colSpan={header.colSpan}
            aria-sort={ariaSort}
            className={clsx(
                style['t-cell'],
                hideHeader && style['hide-header'],
                isActionsColumn && style['t-cell__actions'],
                isActionsColumn && hasFixedRightColumns && style['t-cell__actions--no-shadow'],
                isFixed && style['t-cell__fixed'],
                isFixedRight && style['t-cell__fixed-right'],
            )}
            style={{
                ...getTableHeaderStyle({ enableResizing, header, tableWidth }),
                ...(isFixed && { left }),
                ...(isFixedRight && { right }),
            }}
        >
            <div
                className={clsx(
                    'flex items-center justify-start',
                    hideHeader ? style['hide-table-header'] : style['show-table-header'],
                    canSort && style['sortable-column'],
                    header.column.columnDef.className,
                )}
                role={canSort ? 'button' : undefined}
                tabIndex={canSort ? 0 : undefined}
                onClick={(e) => {
                    const sortingHandler = header.column.getToggleSortingHandler()
                    if (!isResizing && sortingHandler) {
                        sortingHandler(e)
                    }
                    disableResizingFlag()
                }}
                onKeyDown={
                    canSort
                        ? (e) => {
                              if (e.key !== 'Enter' && e.key !== ' ') return
                              e.preventDefault()
                              const sortingHandler = header.column.getToggleSortingHandler()
                              if (!isResizing && sortingHandler) sortingHandler(e)
                              disableResizingFlag()
                          }
                        : undefined
                }
            >
                <div className={style['header-content']}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                </div>
                {{
                    asc: <DropUpIcon className={style['sort-icon']} />,
                    desc: <DropDownIcon className={style['sort-icon']} />,
                }[header.column.getIsSorted() as string] ?? null}
                {tableCanResize &&
                    (!enableResizing ? header.id !== lastColumn?.id : true) &&
                    header.column.getCanResize() &&
                    !INTERNAL_COLUMN_IDS.includes(header.column.id) && (
                        <div
                            {...{
                                onDoubleClick: () => header.column.resetSize(),
                                onMouseDown: (e) => {
                                    e.stopPropagation()
                                    enableResizingFlag()
                                    header.getResizeHandler()(e)
                                },
                                onTouchStart: (e) => {
                                    e.stopPropagation()
                                    enableResizingFlag()
                                    header.getResizeHandler()(e)
                                },
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
