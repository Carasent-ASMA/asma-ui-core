import { flexRender, type Header } from '@tanstack/react-table'
import { useMemo, useRef } from 'react'
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
}) {
    const { hideHeader = false, enableResizing = false, actions, customActionsNode } = styledTableProps
    const ref = useRef<HTMLTableCellElement | null>(null)
    const { isResizing, enableResizingFlag, disableResizingFlag } = useRootContext()

    const isFixed = header.column.columnDef.fixedLeft
    const isFixedRight = Boolean(header.column.columnDef.fixedRight)
    const isActionsColumn = header.column.id === ACTIONS_COLUMN_ID
    const shouldStickActionsCell = Boolean(actions) || Boolean(customActionsNode)

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

    return (
        <th
            ref={ref}
            key={header.id}
            colSpan={header.colSpan}
            className={clsx(
                style['t-cell'],
                hideHeader && style['hide-header'],
                // *
                //  sticky actions
                isActionsColumn && style['t-cell__actions'],
                isActionsColumn && !shouldStickActionsCell && style['t-cell__actions--not-fixed'],
                isActionsColumn && shouldStickActionsCell && hasFixedRightColumns && style['t-cell__actions--no-shadow'],
                isFixed && style['t-cell__fixed'],
                isFixedRight && style['t-cell__fixed-right'],
            )}
            style={{
                ...getTableHeaderStyle({ enableResizing, header, element: ref.current, tableWidth }),
                ...(isFixed && { left }),
                ...(isFixedRight && { right }),
            }}
        >
            <div
                className={clsx(
                    'flex items-center justify-left',
                    hideHeader ? style['hide-table-header'] : style['show-table-header'],
                    header.column.getCanSort() && style['sortable-column'],
                    header.column.columnDef.className,
                )}
                onClick={(e) => {
                    const sortingHandler = header.column.getToggleSortingHandler()
                    if (!isResizing && sortingHandler) {
                        sortingHandler(e)
                    }
                    disableResizingFlag()
                }}
            >
                {flexRender(header.column.columnDef.header, header.getContext())}
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
                                    window.addEventListener('mouseup', () =>
                                        handleMouseUp({ styledTableProps, header }),
                                    )
                                },
                                onTouchStart: (e) => {
                                    e.stopPropagation()
                                    enableResizingFlag()
                                    header.getResizeHandler()(e)
                                    window.addEventListener('mouseup', () =>
                                        handleMouseUp({ styledTableProps, header }),
                                    )
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

function handleMouseUp<TData, TCustomData = Record<string, unknown>>({
    styledTableProps,
    header,
}: {
    styledTableProps: StyledTableProps<TData, TCustomData>
    header: Header<TData, unknown>
}) {
    if (styledTableProps.uniqueKey) {
        const localStorageKey = styledTableProps.uniqueKey

        const storedDimensions = localStorage.getItem(localStorageKey)
        let parsedDimensions: Record<string, number> = {}

        if (storedDimensions) {
            try {
                parsedDimensions = JSON.parse(storedDimensions)
            } catch (error) {
                console.warn('Failed to parse stored dimensions. Resetting.')
                parsedDimensions = {}
            }
        }

        parsedDimensions[header.column.id] = header.column.getSize()

        localStorage.setItem(localStorageKey, JSON.stringify(parsedDimensions))
    }
}
