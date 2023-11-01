import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type TableOptions,
    getSortedRowModel,
    getFilteredRowModel,
    type Table,
    getExpandedRowModel,
    type Row,
} from '@tanstack/react-table'
import clsx from 'clsx'
import { Fragment, type ReactElement, useMemo, useRef, type MouseEvent, useCallback } from 'react'
import { DropDownIcon, DropUpIcon, LoadingIcon } from '../data-display/icons'
import { StyledMenu, StyledMenuItem } from '../navigation/menu'
import { useToggleMenuVisibility } from './useToggleMenuVisibility'
import { StyledCheckbox } from '../inputs/checkbox'
import { Skeleton } from '@mui/material'
import { generateActionsColumn } from './components/columns/actionColumn'
import { widthStabilizer } from './components/columns/widthStabilizer'

const SELECT_COLUMN_ID = 'select'

export interface StyledTableProps<TData, TCustomData>
    extends Omit<
        TableOptions<TData>,
        'getCoreRowModel' | 'getExpandedRowModel' | 'getFilteredRowModel' | 'getSortedRowModel'
    > {
    actions?: (row: Row<TData>) => {
        label: string
        className?: string
        disabled?: boolean
        hide?: boolean
        onClick?: (row: Row<TData>) => void
    }[]
    autoSize?: boolean
    customSubRowData?: Map<string, TCustomData[]>
    disableHeaderPin?: boolean
    loading?: boolean
    noRowsOverlay?: ReactElement
    tableInstanceRef?: React.MutableRefObject<Table<TData> | null>
    className?: string
    rowHeight?: number
    tdClassName?: string
    thClassName?: string
    getRowClassName?: (row: Row<TData>) => string
    onRowClick?: (e: MouseEvent<HTMLTableRowElement, globalThis.MouseEvent>, row: Row<TData>) => void
    renderSubRows?: (props: { rows: TCustomData[]; row: TData }) => ReactElement
    getRowSelectionIds?: (ids: string[]) => void
}

export const StyledTable = <
    TData extends {
        id: string | number
    },
    TCustomData = Record<string, unknown>,
>({
    actions,
    autoSize = true,
    columns,
    data,
    customSubRowData,
    initialState,
    enableRowSelection,
    disableHeaderPin,
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
    ...rest
}: StyledTableProps<TData, TCustomData>) => {
    const { anchorEl, open, handleClose, handleOpen } = useToggleMenuVisibility()
    const {
        anchorEl: anchorPin,
        open: openPin,
        handleClose: handleClosePin,
        handleOpen: handleOpenPin,
    } = useToggleMenuVisibility()

    const currentRowRef = useRef<Row<TData> | null>(null)
    const hasActions = typeof actions === 'function'

    if (autoSize && !columns.find((col) => col.id === 'width_stabilizer')) {
        columns.push(widthStabilizer())
    }

    if (!disableHeaderPin && !columns.find((col) => col.id === 'actions')) {
        columns.push(
            generateActionsColumn({
                disableHeaderPin,
                hasActions,
                handleOpenPin,
                handleOpenCellAction: (e, info) => {
                    e.stopPropagation()
                    handleOpen(e)
                    currentRowRef.current = info.row
                    pushActions(currentRowRef.current)
                },
            }),
        )
    }

    if (enableRowSelection && !columns.find((col) => col.id === SELECT_COLUMN_ID)) {
        columns.unshift({
            id: SELECT_COLUMN_ID,
            maxSize: 50,
            header: ({ table }) => (
                <StyledCheckbox
                    {...{
                        checked: table.getIsAllRowsSelected(),
                        indeterminate: table.getIsSomeRowsSelected(),
                        onChange: table.getToggleAllRowsSelectedHandler(),
                    }}
                />
            ),
            cell: ({ row }) => (
                <StyledCheckbox
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
        defaultColumn: { minSize: 0, size: Number.MAX_SAFE_INTEGER, maxSize: Number.MAX_SAFE_INTEGER },
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

    const menuItems: JSX.Element[] = useMemo(() => [], [])

    const pushActions = useCallback<(row: Row<TData>) => void>(
        (row) => {
            if (!hasActions || !row) return

            const actionItems = actions(row)

            const hiddenActionsLength = actionItems.filter((action) => action.hide).length ?? 0

            if (hasActions && actionItems.length !== menuItems.length + hiddenActionsLength) {
                menuItems.splice(0, menuItems.length)

                actionItems.forEach((action) => {
                    if (!action.hide) {
                        menuItems.push(
                            <StyledMenuItem
                                key={action.label}
                                className={action.className}
                                disabled={action.disabled}
                                onClick={() => {
                                    if (currentRowRef.current) {
                                        action.onClick?.(currentRowRef.current)
                                    }
                                }}
                            >
                                {action.label}
                            </StyledMenuItem>,
                        )
                    }
                })
            }
        },
        [actions, hasActions, menuItems],
    )

    return (
        <>
            <table className={clsx('animate-opacity-appear-3 border-collapse overflow-y-auto', className)}>
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
                                    let size: number | string = header.getSize()

                                    if (isNaN(size) || size > 1200) {
                                        size = '100%'
                                    } else {
                                        size = `${size}px`
                                    }

                                    return (
                                        <th
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            className={clsx(
                                                'px-2.5 text-delta-500 text-[10px] font-semibold uppercase truncate',
                                                thClassName,
                                            )}
                                            style={{
                                                width: size || '100%',
                                                maxWidth: size || '100%',
                                                minWidth: size || '100%',
                                            }}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    {...{
                                                        className: clsx(
                                                            'flex items-center h-[30px]',
                                                            header.column.getCanSort() || header.column.id === 'actions'
                                                                ? 'cursor-pointer select-none'
                                                                : '',
                                                            header.column.columnDef.className,
                                                        ),
                                                        style: {
                                                            justifyContent:
                                                                header.column.columnDef.headerAlign ?? 'left',
                                                        },
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

                <tbody className='table-row-group'>
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
                                        className={clsx(
                                            'border-x-0 border-y border-solid border-delta-300 hover:cursor-pointer hover:bg-primary-25',
                                            (row.getIsExpanded() || row.getIsSelected()) && 'bg-primary-50',
                                            loading && 'opacity-50',
                                            getRowClassName?.(row),
                                        )}
                                        style={{
                                            height: rowHeight ? `${rowHeight}px` : '50px',
                                        }}
                                        onClick={(e) => {
                                            if (row.getCanExpand()) {
                                                row.getToggleExpandedHandler()()
                                            }

                                            if (onRowClick) onRowClick(e, row)
                                        }}
                                    >
                                        {row.getVisibleCells().map((cell) => {
                                            let size: number | string = cell.column.getSize()

                                            if (isNaN(size) || size > 1200) {
                                                size = '100%'
                                            } else {
                                                size = `${size}px`
                                            }

                                            return (
                                                <td
                                                    key={cell.id}
                                                    className={clsx(
                                                        'align-middle text-sm text-delta-900 px-2.5',
                                                        cell.column.id !== SELECT_COLUMN_ID && 'truncate',
                                                        tdClassName,
                                                    )}
                                                    style={{
                                                        textAlign: cell.column.columnDef.cellAlign ?? 'left',
                                                        width: size || '100%',
                                                        maxWidth: size || '100%',
                                                        minWidth: size || '100%',
                                                    }}
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

            {!disableHeaderPin && (
                <StyledMenu
                    anchorEl={anchorPin}
                    anchorOrigin={{
                        horizontal: 'left',
                        vertical: 'bottom',
                    }}
                    open={openPin}
                    onClose={handleClosePin}
                >
                    {table
                        .getAllLeafColumns()
                        .filter((col) => col.getCanHide() && col.id !== SELECT_COLUMN_ID)
                        .map((column) =>
                            column.columnDef.header ? (
                                <StyledMenuItem
                                    key={column.id}
                                    onClick={() => column.toggleVisibility(!column.getIsVisible())}
                                >
                                    <StyledCheckbox
                                        disableRipple
                                        className='p-0 pr-2'
                                        checked={column.getIsVisible()}
                                    />
                                    {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                                </StyledMenuItem>
                            ) : null,
                        )}
                </StyledMenu>
            )}

            {hasActions && (
                <StyledMenu
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        horizontal: 'left',
                        vertical: 'bottom',
                    }}
                    open={open}
                    onClick={handleClose}
                    onClose={handleClose}
                >
                    {menuItems.map((item) => item)}
                </StyledMenu>
            )}
        </>
    )
}
