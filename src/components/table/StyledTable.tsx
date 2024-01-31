import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    getFilteredRowModel,
    getExpandedRowModel,
    type Row,
    getPaginationRowModel,
} from '@tanstack/react-table'
import clsx from 'clsx'
import { Fragment } from 'react'
import { LoadingIcon } from '../data-display/icons'
import { Skeleton } from '@mui/material'
import { SELECT_COLUMN_ID, type StyledTableProps } from './types'
import { TableHeader } from './components/TableHeader'
import { injectColumns } from './components/columns/injectColumns'
import { TableFooter } from './components/TableFooter'

/**
 *
 * Custom props:
 * @param size: Column sizing. use NaN (width 100%) -  only one time for the main column. It will make the column very responsive.. Example is in Storybook.
 *
 * If you have a very long data, like descriptions. use input to render long strings instead of div. Example is in Storybook.
 *
 *  @param focusable: Used for controlling the focus of rows. If set to true, the tabIndex={0} attribute will be added to each table row. Used, for example, when adding a new item to scroll to it and focus it
 *
 */
export const StyledTable = <
    TData extends {
        id: string | number
    },
    TCustomData = Record<string, unknown>,
>({
    actions,
    columns,
    data,
    customSubRowData,
    initialState,
    enableRowSelection,
    headerPin = true,
    loading,
    noRowsOverlay,
    tableInstanceRef,
    className,
    rowHeight,
    tdClassName,
    getRowClassName,
    onRowClick,
    renderSubRows,
    customActionsNode,
    focusable,
    stickyHeader,
    expandArrow,
    height,
    locale = 'en',
    footer,
    hideHeader,
    hideFooter,
    ...rest
}: StyledTableProps<TData, TCustomData>) => {
    injectColumns({ columns, expandArrow, enableRowSelection, headerPin, actions, customActionsNode })
    const table = useReactTable({
        ...rest,
        columns,
        data,
        initialState: {
            pagination: { pageIndex: 0, pageSize: 50 },
            columnVisibility: {
                ...initialState?.columnVisibility,
                [SELECT_COLUMN_ID]: false,
            },
            ...initialState,
        },
        enableRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getRowId:
            rest.getRowId ||
            ((row: TData, _index: number, parent?: Row<TData>) =>
                parent ? [parent.id, row.id].join('.') : row.id.toString()),
    })

    if (tableInstanceRef) {
        tableInstanceRef.current = table
    }

    const rows = hideFooter ? table.getCoreRowModel().rows : table.getRowModel().rows

    const renderRow = (row: Row<TData>, index: number) => (
        <Fragment key={row.id}>
            <tr
                data-index={index}
                data-test={row.id}
                id={row.id}
                tabIndex={focusable ? -1 : undefined}
                className={clsx(
                    'table-row align-middle border-solid border-x border-t border-b-0 last:border-b-transparent first:border-t-transparent border-x-transparent border-y-delta-300 hover:cursor-pointer hover:bg-gama-25 focus:bg-gama-50 focus:border focus:border-gama-500',
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
                    return (
                        <td
                            key={cell.id}
                            className={clsx(
                                'break-words table-cell align-middle text-sm text-delta-900 whitespace-pre-wrap',
                                'px-2.5 py-0',
                                tdClassName,
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

    return (
        <div>
            <div className={clsx('overflow-auto w-full', className)} style={{ height }}>
                <table
                    className={clsx(
                        'table box-border border-collapse animate-opacity-appear-3 border-spacing-[1px] max-w-[inherit] m-0 w-[calc(100%-5px)]',
                    )}
                >
                    {!loading && <TableHeader table={table} stickyHeader={stickyHeader} hideHeader={hideHeader} />}

                    <tbody className='table-row-group align-middle max-w-[inherit]'>
                        {data.length > 0 && loading ? (
                            <LoadingIcon
                                className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gama-500 z-10'
                                width={50}
                                height={50}
                            />
                        ) : null}

                        {data.length === 0 && loading ? (
                            <>
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={index}>
                                        <td colSpan={columns.length}>
                                            <Skeleton key={index} variant='text' width='100%' height={50} />
                                        </td>
                                    </tr>
                                ))}
                            </>
                        ) : data.length > 0 ? (
                            rows.map((row, index) => renderRow(row, index))
                        ) : (
                            <tr className='h-28'>
                                <td
                                    colSpan={columns.length}
                                    className='text-center align-middle text-sm text-delta-900'
                                >
                                    {noRowsOverlay}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {!hideFooter && (
                <TableFooter table={table} locale={locale}>
                    {footer?.(table)}
                </TableFooter>
            )}
        </div>
    )
}
