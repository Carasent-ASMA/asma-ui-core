import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type TableOptions,
    getSortedRowModel,
    createColumnHelper,
    getFilteredRowModel,
    type Table,
    getExpandedRowModel,
    type Row,
} from '@tanstack/react-table'
import clsx from 'clsx'
import { Fragment, useEffect, type ReactElement, useMemo, useRef } from 'react'
import { DotsVerticalIcon, DropDownIcon, DropUpIcon } from '../data-display/icons'
import { StyledMenu, StyledMenuItem } from '../navigation/menu'
import { StyledButton } from '../inputs/button'
import { Icon } from '@iconify/react'
import { useToggleMenuVisibility } from './useToggleMenuVisibility'
import { StyledCheckbox } from '../inputs/checkbox'

const SELECT_COLUMN_ID = 'select'

interface StyledTableProps<TData, TCustomData>
    extends Omit<
        TableOptions<TData>,
        'getCoreRowModel' | 'getExpandedRowModel' | 'getFilteredRowModel' | 'getSortedRowModel'
    > {
    actions?: { label: string; disabled?: boolean; onClick?: (row: Row<TData>) => void }[]
    customSubRowData?: Map<string, TCustomData[]>
    disableHeaderPin?: boolean
    tableInstanceRef?: React.MutableRefObject<Table<TData> | null>
    tdClassName?: string
    thClassName?: string
    renderSubRows?: (props: { rows: TCustomData[] }) => ReactElement
}

export const StyledTable = <
    TData extends {
        id: string
    },
    TCustomData = Record<string, unknown>,
>({
    actions,
    columns,
    data,
    customSubRowData,
    initialState,
    enableRowSelection,
    disableHeaderPin,
    tableInstanceRef,
    tdClassName,
    thClassName,
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

    const hasActions = actions && actions.length > 0

    const currentRowRef = useRef<Row<TData> | null>(null)

    const actionColumn = createColumnHelper<TData>().display({
        id: 'actions',
        enableHiding: false,
        enableSorting: false,
        maxSize: 50,
        header: () =>
            !disableHeaderPin && (
                <Icon icon='mdi:pin' className='text-delta-600' width={20} height={20} onClick={handleOpenPin} />
            ),
        cell: (info) =>
            hasActions ? (
                <StyledButton
                    className='m-auto'
                    variant='text'
                    size='small'
                    onClick={(e) => {
                        e.stopPropagation()
                        handleOpen(e)
                        currentRowRef.current = info.row
                    }}
                >
                    <DotsVerticalIcon className='!text-delta-800' width={24} height={24} />
                </StyledButton>
            ) : null,
    })

    if (!disableHeaderPin && !columns.find((col) => col.id === actionColumn.id)) {
        columns.push(actionColumn)
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
                <div className='px-1'>
                    <StyledCheckbox
                        {...{
                            checked: row.getIsSelected(),
                            disabled: !row.getCanSelect(),
                            indeterminate: row.getIsSomeSelected(),
                            onChange: row.getToggleSelectedHandler(),
                        }}
                    />
                </div>
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
    })

    if (tableInstanceRef) {
        tableInstanceRef.current = table
    }

    const menuItems: JSX.Element[] = useMemo(() => [], [])

    useEffect(() => {
        if (hasActions && actions.length !== menuItems.length) {
            actions.forEach((action) =>
                menuItems.push(
                    <StyledMenuItem
                        key={action.label}
                        disabled={action.disabled}
                        onClick={() => {
                            if (currentRowRef.current) {
                                action.onClick?.(currentRowRef.current)
                            }
                        }}
                    >
                        {action.label}
                    </StyledMenuItem>,
                ),
            )
        }
    }, [actions, hasActions, menuItems])

    return (
        <>
            <table className='border-collapse table-fixed w-full'>
                <thead className='table-header-group bg-[#fcfcfd] border-x-0 border-y border-solid border-y-delta-300'>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        className={clsx(
                                            'px-2.5 text-delta-500 text-[10px] font-semibold uppercase overflow-hidden whitespace-nowrap overflow-ellipsis',
                                            thClassName,
                                        )}
                                        style={{
                                            width:
                                                header.getSize() === Number.MAX_SAFE_INTEGER
                                                    ? 'auto'
                                                    : header.getSize(),
                                        }}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div
                                                {...{
                                                    className: clsx(
                                                        'flex justify-center items-center h-[30px]',
                                                        header.column.getCanSort() ? 'cursor-pointer select-none' : '',
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
                    ))}
                </thead>

                <tbody className='table-row-group'>
                    {table.getRowModel().rows.map((row) => {
                        return (
                            <Fragment key={row.id}>
                                <tr
                                    className={clsx(
                                        'border-x-0 border-y border-solid border-delta-300 h-[50px] hover:cursor-pointer hover:bg-primary-25',
                                        (row.getIsExpanded() || row.getIsSelected()) && 'bg-primary-50',
                                    )}
                                    onClick={row.getToggleExpandedHandler()}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        return (
                                            <td
                                                key={cell.id}
                                                className={clsx(
                                                    'text-center align-middle text-sm text-delta-900',
                                                    tdClassName,
                                                )}
                                                style={{
                                                    width:
                                                        cell.column.getSize() === Number.MAX_SAFE_INTEGER
                                                            ? 'auto'
                                                            : cell.column.getSize(),
                                                }}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        )
                                    })}
                                </tr>
                                {row.getIsExpanded() && (
                                    <tr>
                                        <td
                                            colSpan={row.getVisibleCells().length}
                                            className='border-t border-delta-300'
                                        >
                                            {customSubRowData &&
                                                renderSubRows &&
                                                renderSubRows({
                                                    rows: customSubRowData.get(row.original.id) ?? [],
                                                })}
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        )
                    })}
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
