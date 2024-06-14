import { flexRender, type Row } from '@tanstack/react-table'
import { Fragment } from 'react'
import type { StyledTableProps } from '../types'

import style from '../StyledTable.module.scss'
import clsx from 'clsx'

export function TableRow<
    TData extends {
        id: string | number
    },
    TCustomData = Record<string, unknown>,
>({
    styledTableProps,
    row,
    index,
}: {
    styledTableProps: StyledTableProps<TData, TCustomData>
    row: Row<TData>
    index: number
}) {
    const {
        focusable,
        loading,
        getRowClassName,
        rowHeight,
        onRowClick,
        expandArrow,
        tdClassName,
        customSubRowData,
        renderSubRows,
    } = styledTableProps

    const onMouseUp = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
        if (
            (e.target as HTMLDivElement).classList.contains('MuiModal-backdrop') ||
            (e.target as Node).nodeName === 'INPUT' ||
            (e.target as Node).nodeName === 'BUTTON'
        )
            return

        if (row.getCanExpand() && !expandArrow) {
            row.getToggleExpandedHandler()()
        }

        document.getElementById(row.id)?.focus()

        const selection = window.getSelection()?.type === 'Range'

        if (onRowClick && !selection) onRowClick(e, row)
    }

    return (
        <Fragment key={row.id}>
            <tr
                data-index={index}
                data-test={row.id}
                id={row.id}
                tabIndex={focusable ? -1 : undefined}
                className={clsx(
                    style['t-row'],
                    loading && style['is-loading'],
                    (row.getIsExpanded() || row.getIsSelected()) && style['selected'],
                    getRowClassName?.(row),
                )}
                style={{
                    height: rowHeight ? `${rowHeight}px` : 'inherit',
                }}
                onMouseUp={onMouseUp}
            >
                {row.getVisibleCells().map((cell) => {
                    // *
                    //  sticky actions
                    const isActionsCell = cell.column.id === 'actions'
                    return (
                        <td
                            key={cell.id}
                            className={clsx(
                                style['t-cell'],
                                tdClassName,
                                // *
                                //  sticky actions
                                isActionsCell && style['action-cell'],
                                isActionsCell && (row.getIsExpanded() || row.getIsSelected()) && style['selected'],
                                isActionsCell &&
                                    (getRowClassName?.(row)
                                        ? getRowClassName?.(row)
                                        : style['action-cell-default-background']),
                            )}
                        >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                    )
                })}
            </tr>
            {row.getIsExpanded() && (
                <>
                    {customSubRowData &&
                        renderSubRows &&
                        renderSubRows({
                            rows: customSubRowData.get(row.original.id.toString()) ?? [],
                            row: row.original,
                        })}
                </>
            )}
        </Fragment>
    )
}
