import { flexRender, type Row } from '@tanstack/react-table'
import { Fragment } from 'react'
import { cn } from 'src/helpers/cn'
import type { StyledTableProps } from '../types'

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

    return (
        <Fragment key={row.id}>
            <tr
                data-index={index}
                data-test={row.id}
                id={row.id}
                tabIndex={focusable ? -1 : undefined}
                className={cn(
                    'table-row align-middle group border-solid border-x border-t border-b-0 last:border-b-transparent first:border-t-transparent border-x-transparent border-y-delta-300 hover:cursor-pointer hover:bg-gama-25 focus:bg-gama-50 focus:border focus:border-gama-500',
                    (row.getIsExpanded() || row.getIsSelected()) && 'bg-gama-50',
                    loading && 'opacity-50',
                    getRowClassName?.(row),
                )}
                style={{
                    height: rowHeight ? `${rowHeight}px` : 'inherit',
                }}
                onMouseDown={(e) => {
                    if (
                        (e.target as HTMLDivElement).classList.contains('MuiModal-backdrop') ||
                        (e.target as Node).nodeName === 'INPUT' ||
                        (e.target as Node).nodeName === 'BUTTON'
                    )
                        return
                    if (row.getCanExpand() && !expandArrow) {
                        row.getToggleExpandedHandler()()
                    }

                    if (onRowClick) onRowClick(e, row)
                }}
            >
                {row.getVisibleCells().map((cell) => {
                    // *
                    //  sticky actions
                    const isActionsCell = cell.column.id === 'actions'
                    return (
                        <td
                            key={cell.id}
                            className={cn(
                                'break-words table-cell align-middle text-sm text-delta-900 whitespace-pre-wrap',
                                'px-2.5 py-0',
                                tdClassName,
                                // *
                                //  sticky actions
                                isActionsCell && 'bg-white sticky right-[-1px] group-hover:bg-gama-25',
                                isActionsCell && getRowClassName?.(row),
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
