import type { CellContext, ColumnMeta, HeaderContext, Row, TableOptions, Table } from '@tanstack/react-table'
import type { AccessorFn, ColumnDefTemplate } from '@tanstack/react-table'
import type {
    ColumnPinningColumnDef,
    ColumnSizingColumnDef,
    FiltersColumnDef,
    GroupingColumnDef,
    RowData,
    SortingColumnDef,
    VisibilityColumnDef,
} from '@tanstack/react-table'
import type { MouseEvent, ReactElement, ReactNode } from 'react'

declare module '@tanstack/react-table' {
    interface ColumnDefExtensions<TData extends RowData, TValue = unknown>
        extends VisibilityColumnDef,
            ColumnPinningColumnDef,
            FiltersColumnDef<TData>,
            SortingColumnDef<TData>,
            GroupingColumnDef<TData, TValue>,
            ColumnSizingColumnDef {
        className?: string
        cellAlign?: 'left' | 'center' | 'right'
        headerAlign?: 'left' | 'center' | 'right'
    }

    interface ColumnDefBase<TData extends RowData, TValue = unknown> extends ColumnDefExtensions<TData, TValue> {
        getUniqueValues?: AccessorFn<TData, unknown[]>
        footer?: ColumnDefTemplate<HeaderContext<TData, TValue>>
        cell?: ColumnDefTemplate<CellContext<TData, TValue>>
        meta?: ColumnMeta<TData, TValue>
    }
}

export interface IAction<TData> {
    label: ReactNode
    className?: string
    disabled?: boolean
    hide?: boolean
    onClick?: (row: Row<TData>) => void
}

type IFooter<TData> = {
    footer?: (table: Table<TData>) => ReactNode
    hideFooter?: never
}

type IHideFooter = {
    footer?: never
    hideFooter?: boolean
}

type TFooter<TData> = IFooter<TData> | IHideFooter
type TTableOptions<TData> = TableOptions<TData>

export type * from '@tanstack/react-table'

export type StyledTableProps<TData, TCustomData> = {
    locale?: 'no' | 'en'
    height?: string | number
    actions?: (row: Row<TData>) => IAction<TData>[]
    customActionsNode?: (row: CellContext<TData, TData>) => ReactNode
    customSubRowData?: Map<string, TCustomData[]>
    headerPin?: boolean
    expandArrow?: boolean
    loading?: boolean
    noRowsOverlay?: ReactElement
    tableInstanceRef?: React.MutableRefObject<Table<TData> | null>
    className?: string
    rowHeight?: number
    tdClassName?: string
    focusable?: boolean
    stickyHeader?: boolean
    getRowClassName?: (row: Row<TData>) => string
    onRowClick?: (e: MouseEvent<HTMLTableRowElement, globalThis.MouseEvent>, row: Row<TData>) => void
    renderSubRows?: (props: { rows: TCustomData[]; row: TData }) => ReactElement | null
    getRowSelectionIds?: (ids: string[]) => void
    hideHeader?: boolean
    pageSize?: number
    enableResizing?: boolean
} & Omit<
    TTableOptions<TData>,
    'getCoreRowModel' | 'getExpandedRowModel' | 'getFilteredRowModel' | 'getSortedRowModel'
> &
    TFooter<TData>

export const SELECT_COLUMN_ID = 'select'
export const EXPAND_COLUMN_ID = 'expand-column-id'
export const ACTIONS_COLUMN_ID = 'actions'
