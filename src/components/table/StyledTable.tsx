import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    getFilteredRowModel,
    getExpandedRowModel,
    type Row,
} from '@tanstack/react-table'
import clsx from 'clsx'
import { Fragment } from 'react'
import { DropDownIcon, DropUpIcon, LoadingIcon } from '../data-display/icons'
import { StyledCheckbox } from '../inputs/checkbox'
import { Skeleton } from '@mui/material'
import { generateActionsColumn } from './components/columns/action-column/actionColumn'
import type { StyledTableProps } from './types'

export const SELECT_COLUMN_ID = 'select'

/**
 *
 * Custom props:
 * @param size: Column sizing. use NaN (width 100%) -  only one time for the main column. It will make the column very responsive.. Example is in Storybook.
 *
 * If you have a very long data, like descriptions. use input to render long strings instead of div. Example is in Storybook.
 *
 *  @param focusable: Used for controlling the focusability of rows. If set to true, the tabIndex={0} attribute will be added to each table row. Used, for example, when adding a new item to scroll to it and focus it
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
    thClassName,
    getRowClassName,
    onRowClick,
    renderSubRows,
    customActionsNode,
    focusable,
    ...rest
}: StyledTableProps<TData, TCustomData>) => {
    if (!columns.find((col) => col.id === 'actions')) {
        columns.push(
            generateActionsColumn({
                headerPin,
                actions,
                customActionsNode,
            }),
        )
    }

    if (enableRowSelection && !columns.find((col) => col.id === SELECT_COLUMN_ID)) {
        columns.unshift({
            id: SELECT_COLUMN_ID,
            maxSize: 50,
            header: ({ table }) => (
                <StyledCheckbox
                    dataTest='test'
                    {...{
                        checked: table.getIsAllRowsSelected(),
                        indeterminate: table.getIsSomeRowsSelected(),
                        onChange: table.getToggleAllRowsSelectedHandler(),
                    }}
                />
            ),
            cell: ({ row }) => (
                <StyledCheckbox
                    dataTest='test'
                    {...{
                        checked: row.getIsSelected(),
                        disabled: !row.getCanSelect(),
                        indeterminate: row.getIsSomeSelected(),
                        onClick: (e) => e.stopPropagation(),
                        onChange: row.getToggleSelectedHandler(),
                    }}
                />
            ),
        })
    }

    const table = useReactTable({
        ...rest,
        columns,
        data,
        initialState: {
            ...initialState,
            columnVisibility: {
                ...initialState?.columnVisibility,
                [SELECT_COLUMN_ID]: false,
            },
        },
        enableRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getRowId:
            rest.getRowId ||
            ((row: TData, _index: number, parent?: Row<TData>) =>
                parent ? [parent.id, row.id].join('.') : row.id.toString()),
    })

    if (tableInstanceRef) {
        tableInstanceRef.current = table
    }

    return (
        <table
            className={clsx(
                'table box-border border-collapse animate-opacity-appear-3 border-spacing-[1px] max-w-[inherit] mx-auto w-full',
                className,
            )}
        >
            <thead className='table-header-group bg-[#fcfcfd] border-t-solid border-b-solid  border-y-delta-300 border-y cursor-default'>
                {data.length === 0 && loading ? (
                    <tr>
                        <th colSpan={columns.length}>
                            <Skeleton variant='text' />
                        </th>
                    </tr>
                ) : (
                    table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                let columnWidth: number | string = header.getSize()

                                // setup size, if user predefined it in column builder
                                if (columnWidth) {
                                    columnWidth = `min-w-[${columnWidth}px] w-[${columnWidth}px] max-w-[${columnWidth}px]`
                                }

                                // last column, except actions
                                const lastUserColumn = header.headerGroup.headers[header.headerGroup.headers.length - 2]
                                //  setup full width for last user created column
                                if (lastUserColumn?.id === header.id || !columnWidth) {
                                    columnWidth = 'w-full'
                                }

                                return (
                                    <th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        className={clsx(
                                            columnWidth,
                                            header.id.includes('width_stabilizer') ? 'p-0 m-0' : 'px-2.5',
                                            'text-delta-500 text-start text-[10px] font-semibold uppercase justify-start truncate',
                                            thClassName,
                                        )}
                                        style={{
                                            maxWidth: header.column.columnDef.maxSize,
                                            minWidth: header.column.columnDef.minSize,
                                        }}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div
                                                {...{
                                                    className: clsx(
                                                        'flex items-center h-[30px] justify-left',
                                                        header.column.getCanSort() || header.column.id === 'actions'
                                                            ? 'cursor-pointer select-none'
                                                            : '',
                                                        header.column.columnDef.className,
                                                    ),
                                                    onClick: header.column.getToggleSortingHandler(),
                                                }}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {{
                                                    asc: <DropUpIcon className='text-delta-800' />,
                                                    desc: <DropDownIcon className='text-delta-800' />,
                                                }[header.column.getIsSorted() as string] ?? null}
                                            </div>
                                        )}
                                    </th>
                                )
                            })}
                        </tr>
                    ))
                )}
            </thead>

            <tbody className='table-row-group align-middle max-w-[inherit]'>
                {data.length > 0 && loading ? (
                    <LoadingIcon
                        className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-500 z-10'
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
                    table.getRowModel().rows.map((row) => {
                        return (
                            <Fragment key={row.id}>
                                <tr
                                    data-test={row.id}
                                    tabIndex={focusable ? 0: undefined}
                                    className={clsx(
                                        'table-row align-middle border-x-0 border-y border-solid border-delta-300 hover:cursor-pointer hover:bg-primary-25 focus:bg-primary-100',
                                        (row.getIsExpanded() || row.getIsSelected()) && 'bg-primary-50',
                                        loading && 'opacity-50',
                                        getRowClassName?.(row),
                                    )}
                                    style={{
                                        height: rowHeight ? `${rowHeight}px` : 'inherit',
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        if (
                                            (e.target as HTMLDivElement).classList.contains('MuiModal-backdrop') ||
                                            (e.target as Node).nodeName === 'INPUT' ||
                                            (e.target as Node).nodeName === 'BUTTON'
                                        )
                                            return
                                        if (row.getCanExpand()) {
                                            row.getToggleExpandedHandler()()
                                        }

                                        if (onRowClick) onRowClick(e, row)
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        // let size: number | string = cell.column.getSize()

                                        // if (isNaN(size) || size > 1200) {
                                        //     size = '100%'
                                        // } else {
                                        //     size = `${size}px`
                                        // }
                                        return (
                                            <td
                                                key={cell.id}
                                                className={clsx(
                                                    'break-words table-cell align-middle text-sm text-delta-900 whitespace-pre-wrap',
                                                    cell.id.includes('width_stabilizer') ? 'p-0 m-0' : 'px-2.5',
                                                    cell.column.id !== SELECT_COLUMN_ID && 'truncate',
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
                    })
                ) : (
                    <tr className='h-28'>
                        <td colSpan={columns.length} className='text-center align-middle text-sm text-delta-900'>
                            {noRowsOverlay}
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    )
}
