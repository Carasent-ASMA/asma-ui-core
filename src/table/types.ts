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
import type { TooltipProps } from 'src/components/data-display/tooltip/StyledTooltip'
import type {
    FocusedRowsOptions,
    FocusedRowsTableState,
    FocusedRow,
    FocusedRowsInstance,
} from './custom-features/focus-rows'
import type {
    ColumnSettingsInstance,
    OrderedColumnsOptions,
    OrderedColumnsTableState,
} from './custom-features/order-columns'
import type { RowSelectionTooltipOptions, RowSelectionTooltipRow } from './custom-features/row-selection-tooltip'

declare module '@tanstack/react-table' {
    interface TableState extends ExpandedRowsTableState, FocusedRowsTableState, OrderedColumnsTableState {}

    interface TableOptionsResolved<TData extends RowData>
        extends ExpandedRowsOptions, FocusedRowsOptions, OrderedColumnsOptions, RowSelectionTooltipOptions<TData> {}

    interface Row<TData extends RowData> extends ExpandedRow, FocusedRow, RowSelectionTooltipRow<TData> {}

    interface Table<TData extends RowData> extends ExpandedRowsInstance, FocusedRowsInstance, ColumnSettingsInstance {
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
        locale?: 'no' | 'en' | (TData extends never ? never : never)
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

interface IFooter<TData> {
    footer?: (table: Table<TData>) => ReactNode
    hideFooter?: never
}

interface IHideFooter {
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
    /**
     * Receives the actions cell context for the internal actions column.
     * Use row.original and the row APIs instead of getValue(), because this column stores an unknown accessor value.
     */
    customActionsNode?: (row: CellContext<TData, unknown>) => ReactNode
    customSubRowData?: Map<string, TCustomData[]>
    headerPin?: boolean
    /**
     * Pins the internal actions column's body cells to the right edge. By default they are pinned
     * when the column renders actions (`actions` / `customActionsNode`) or the table has fixed-right
     * columns; a column that only hosts the header pin menu scrolls with the data. The header cell
     * with the pin menu stays pinned either way. Not supported as `false` together with fixed-right
     * columns: their body and header offsets would no longer match.
     */
    stickyActions?: boolean
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
    /**
     * The row the user is working with — e.g. the one opened in a side panel or preview — matched
     * against `row.id`. Drawn in the Figma table-row **Selected** state: the `table/bg-row-selected`
     * (gama-25) fill with a 2px `border/selected` (gama-400) frame around the whole row, kept on
     * hover. Keyboard focus on it still shows the 3px Focused frame. Pass the
     * opened row's id (and `null` when nothing is open). Opt-in: tables that do not pass it are unchanged.
     */
    activeRowId?: string | null
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
    /**
     * Temporary opt-in (ASMA-8597, owner decision D1, 2026-10-27): save and restore this table's
     * sorting under `${uniqueKey}:sorting`, and let Reset columns reset it. Needs `uniqueKey`;
     * ignored without it. Off by default until UX and privacy approve the fleet rollout, which
     * makes `uniqueKey` alone enough and retires this prop (follow-up ASMA-8698).
     */
    persistSorting?: boolean
    /**
     * Opt-in (ASMA-8695, D-OPTIN): save and restore this table's column order under `${uniqueKey}:column-order` and its
     * column visibility under `${uniqueKey}:column-visibility`. Needs a per-user `uniqueKey` (`getTableSettingsKey` of
     * asma-core-helpers); without one nothing is saved. Off by default: a table that does not set it behaves as before.
     *
     * Declare the layout the table opens with in `initialState.columnOrder` and `initialState.columnVisibility`; they are
     * the defaults, so a column hidden by default is hidden for every user until one shows it. A saved layout beats them
     * (the saved order and visibility, not `initialState`, decide what a user sees), the column settings dot follows the
     * defaults (no dot for a column that is hidden by default), a column missing from a saved order appears at its
     * definition position, and Reset columns also restores the default visibility.
     *
     * The table then owns visibility: do not pass `state.columnVisibility` or `onColumnVisibilityChange` (development builds
     * warn). The old unscoped entries are migrated once, by the first user who opens the table on a browser, and then
     * deleted (only after the user's own entry is written): `persistColumnOrderKey`'s order, and the visibility entry named by
     * `legacyColumnVisibilityKey`. A table with this prop and no `uniqueKey` saves nothing and leaves the old entries alone.
     *
     * The table also keeps its state in step with its props: a column added later takes its definition position in an order
     * the user changed, and a changed `initialState` default reaches the user who had not changed that column. A column that
     * an order does not list, a saved one or `initialState.columnOrder`, appears at its definition position, not at the end
     * (so a partial `initialState.columnOrder` no longer puts the listed columns first on a table that opts in).
     */
    persistColumnLayout?: boolean
    /**
     * The key an app used to save its column visibility under before it opted in with `persistColumnLayout`: a raw
     * `{ [columnId]: boolean }` map of the whole visibility state. It is read once, to carry the user's layout over into the
     * user's own entry, and deleted once that entry is written (if storage refuses the write the old entry stays, and the
     * next visit tries again). Reset columns deletes it too. Used only by a table with `persistColumnLayout` **and** a
     * `uniqueKey`; without a key the table neither reads nor deletes it (ASMA-8695, D-MIGRATE).
     */
    legacyColumnVisibilityKey?: string
    /**
     * Whether the table's columns can be resized with the pointer. **On by default** (ASMA-8597, UX round 4, D15): every data
     * column has a handle, except ui-core's own columns (select, expand, actions, drag handle, show full text), a column that
     * opts out with `enableResizing: false` or has a fixed width (`minSize` equal to `maxSize`), and the last data column,
     * which keeps filling the remaining width (unless the table sets `enableResizing`). `enableColumnResizing={false}` turns
     * resizing off for the table.
     *
     * Saving the widths is a separate opt-in (D17): widths are read and written under `${uniqueKey}:column-sizing` only when
     * a table sets `enableColumnResizing` itself, as `true`. A table that gets resizing from the default resizes in memory only.
     * Give it a per-user `uniqueKey` (`getTableSettingsKey` of asma-core-helpers) and write `enableColumnResizing` to save.
     *
     * A column without a `minSize` gets the smaller of 100 px and its default width as its minimum. Every sortable data column
     * is 20 px wider by default (so its sort triangle fits), and so are its `minSize` and `maxSize` when set; widths a user
     * saved and the app's `initialState.columnSizing` are applied as given.
     */
    enableColumnResizing?: boolean
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
