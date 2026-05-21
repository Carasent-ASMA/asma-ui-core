import type {
    ColumnPinningColumnDef,
    ColumnSizingColumnDef,
    GroupingColumnDef,
    RowData,
    SortingColumnDef,
    VisibilityColumnDef,
    AccessorFn,
    ColumnDefTemplate,
    CellContext,
    ColumnMeta,
    HeaderContext,
    Row,
    RowModel,
    TableOptions,
    Table,
    ColumnDef,
} from '@tanstack/react-table'
export type * from '@tanstack/react-table'

import type { CSSProperties, MouseEvent, MutableRefObject, ReactElement, ReactNode } from 'react'
import type {
    ExpandedRow,
    ExpandedRowsInstance,
    ExpandedRowsOptions,
    ExpandedRowsTableState,
} from './custom-features/expand-rows'
import type { TooltipProps } from '@mui/material'
import type {
    FocusedRowsOptions,
    FocusedRowsTableState,
    FocusedRow,
    FocusedRowsInstance,
} from './custom-features/focus-rows'
import type { OrderedColumnsOptions, OrderedColumnsTableState } from './custom-features/order-columns'
import type { RowSelectionTooltipOptions, RowSelectionTooltipRow } from './custom-features/row-selection-tooltip'

declare module '@tanstack/react-table' {
    interface TableState extends ExpandedRowsTableState, FocusedRowsTableState, OrderedColumnsTableState {}

    interface TableOptionsResolved<TData extends RowData>
        extends ExpandedRowsOptions, FocusedRowsOptions, OrderedColumnsOptions, RowSelectionTooltipOptions<TData> {}

    interface Row<TData extends RowData> extends ExpandedRow, FocusedRow, RowSelectionTooltipRow<TData> {}

    interface Table<TData extends RowData> extends ExpandedRowsInstance, FocusedRowsInstance {
        getCoreRowModel: () => RowModel<TData>
    }

    interface ColumnDefExtensions<TData extends RowData, TValue = unknown>
        extends
            VisibilityColumnDef,
            ColumnPinningColumnDef,
            // TODO find out what if replacement is needed
            // FiltersColumnDef<TData>,
            SortingColumnDef<TData>,
            GroupingColumnDef<TData, TValue>,
            ColumnSizingColumnDef {
        className?: string
        cellAlign?: 'left' | 'center' | 'right'
        headerAlign?: 'left' | 'center' | 'right'
        fixedLeft?: boolean
        fixedRight?: boolean
        pinnedHeaderText?: string
    }
    interface TableMeta<TData extends RowData> {
        locale?: 'no' | 'en'
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
    tooltipTitle?: string
    tooltipPlacement?: TooltipProps['placement']
    onClick?: (row: Row<TData>) => void
}

export interface ICustomAction<TData> {
    component: (row: Row<TData>, handleClose: () => void) => ReactNode
}

export const isCustomAction = <TData>(
    action: IAction<TData> | ICustomAction<TData>,
): action is ICustomAction<TData> => {
    return (action as ICustomAction<TData>).component !== undefined
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

export type RowActionsState =
    | { state: 'hidden' }
    | { state: 'disabled'; tooltipTitle?: string; tooltipPlacement?: TooltipProps['placement'] }
    | { state: 'enabled' }

export type StyledTableProps<TData, TCustomData> = {
    locale?: 'no' | 'en'
    height?: string | number
    actions?: (row: Row<TData>) => (IAction<TData> | ICustomAction<TData>)[]
    customActionsNode?: (row: CellContext<TData, TData>) => ReactNode
    customSubRowData?: Map<string, TCustomData[]>
    headerPin?: boolean
    expandArrow?: boolean
    defaultExpanded?: boolean
    loading?: boolean
    noRowsOverlay?: ReactNode
    tableInstanceRef?: React.MutableRefObject<Table<TData> | null>
    className?: string
    tableClassName?: string
    tableHeaderClassName?: string
    tableHeaderRef?: MutableRefObject<HTMLTableSectionElement>
    tableHeaderStyle?: CSSProperties
    rowHeight?: number
    tdClassName?: string
    focusable?: boolean
    stickyHeader?: boolean
    getRowClassName?: (row: Row<TData>) => string
    onRowClick?: (
        e: MouseEvent<HTMLTableRowElement, globalThis.MouseEvent> | React.KeyboardEvent<HTMLTableRowElement>,
        row: Row<TData>,
    ) => void
    renderSubRows?: (props: { rows: TCustomData[]; row: TData }) => ReactElement | null
    getRowSelectionIds?: (ids: string[]) => void
    hideHeader?: boolean
    pageSize?: number
    enableResizing?: boolean
    enableDnd?: boolean
    customDndColumnProps?: ColumnDef<TData, unknown>
    disableDndForRow?: (row: Row<TData>) => boolean
    textExpandArrow?: boolean
    customActionsColumnProps?: Partial<ColumnDef<TData, unknown>>
    paginationAlignLeft?: boolean
    singleSelectionRow?: boolean
    rowActionsState?: (row: Row<TData>) => RowActionsState | undefined
    stickyFooter?: boolean
    hideRowCountSelect?: boolean
    /**
     * @info A unique identifier for the table. This name is used to store the table's state in localStorage,
     * ensuring that the table state is persisted across sessions for the specific table instance.
     */
    uniqueKey?: string
} & Omit<
    TTableOptions<TData>,
    'getCoreRowModel' | 'getExpandedRowModel' | 'getFilteredRowModel' | 'getSortedRowModel'
> &
    TFooter<TData>

export const SELECT_COLUMN_ID = 'select'
export const EXPAND_COLUMN_ID = 'expand-column-id'
export const ACTIONS_COLUMN_ID = 'actions'
export const DND_HANDLE_COLUMN_ID = 'dnd-handle'
export const SHOW_FULL_TEXT_ID = 'show-full-text'

export const INTERNAL_COLUMN_IDS = [
    SELECT_COLUMN_ID,
    EXPAND_COLUMN_ID,
    ACTIONS_COLUMN_ID,
    DND_HANDLE_COLUMN_ID,
    SHOW_FULL_TEXT_ID,
]
