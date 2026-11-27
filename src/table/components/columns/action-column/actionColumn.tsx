import type { CellContext, HeaderContext, Row } from '@tanstack/react-table'
import type { ReactNode } from 'react'
import { ACTIONS_COLUMN_ID, type ColumnDef, type IAction, type ICustomAction, type RowActionsState } from 'src/table/types'
import { HeaderActionMenu } from './components/HeaderActionMenu'
import { RowActionMenu } from './components/RowActionMenu'

type TableLocale = 'en' | 'no'

function localeOf<TData>(ctx: HeaderContext<TData, unknown>): TableLocale | undefined {
    return ctx.table.options.meta?.locale
}

/**
 * Must be module-level: `flexRender` does `createElement(header, ctx)`. An inline
 * `header: (ctx) => <HeaderActionMenu …/>` gets a new function identity whenever columns are
 * rebuilt (`onColumnVisibilityChange` → parent setState → `injectColumns`), so React remounts
 * the menu and drops `open`.
 */
function ActionsPinHeader<TData>(ctx: HeaderContext<TData, unknown>): JSX.Element {
    return <HeaderActionMenu headerData={ctx} locale={localeOf(ctx)} />
}

/** The row actions an actions column renders, kept on its definition for `ActionsCell` (a spread copies a symbol key). */
const ROW_ACTIONS = Symbol('asma-row-actions')

interface RowActionsOptions<TData> {
    actions?: (row: Row<TData>) => (IAction<TData> | ICustomAction<TData>)[]
    customActionsNode?: (row: CellContext<TData, unknown>) => ReactNode
    rowHeight?: number
    rowActionsState?: (row: Row<TData>) => RowActionsState | undefined
}

/**
 * Module-level for the same reason as `ActionsPinHeader`. An inline `cell` got a new identity whenever the columns were
 * rebuilt, which an app's inline `actions={() => […]}` does on every render: React remounted the cell, so the ⋮ a dialog
 * had been opened from was gone when the dialog closed, and the focus had nowhere to return (ASMA-8875). An open menu
 * closed the same way.
 */
function ActionsCell<TData>(cell: CellContext<TData, unknown>): JSX.Element | null {
    const options = (cell.column.columnDef as unknown as Record<symbol, RowActionsOptions<TData> | undefined>)[ROW_ACTIONS]
    const { actions, customActionsNode, rowHeight, rowActionsState } = options ?? {}

    if (!actions && !customActionsNode) return null

    return (
        <div className={'flex items-center justify-end gap-x-1'} style={{ height: rowHeight ?? 'auto' }}>
            {customActionsNode && <div>{customActionsNode(cell)}</div>}
            {actions && <RowActionMenu tableData={cell} actions={actions} rowActionsState={rowActionsState} />}
        </div>
    )
}

function ActionsEmptyHeader<TData>(ctx: HeaderContext<TData, unknown>): JSX.Element {
    // Visually blank by design (no pin menu here), but the <th> must still have an
    // accessible name — an empty header cell leaves screen-reader table navigation unable
    // to announce what this column is (axe `empty-table-header`).
    return <span className='sr-only'>{localeOf(ctx) === 'no' ? 'Handlinger' : 'Actions'}</span>
}

export function generateActionsColumn<TData>(options: {
    headerPin: boolean
    actions?: (row: Row<TData>) => (IAction<TData> | ICustomAction<TData>)[]
    customActionsNode?: (row: CellContext<TData, unknown>) => ReactNode
    rowHeight?: number
    customActionsColumnProps?: Partial<ColumnDef<TData, unknown>>
    rowActionsState?: (row: Row<TData>) => RowActionsState | undefined
    locale?: TableLocale
}): ColumnDef<TData, unknown> {
    const { headerPin, actions, customActionsNode, rowHeight, customActionsColumnProps, rowActionsState } = options

    const column: ColumnDef<TData, unknown> = {
        id: ACTIONS_COLUMN_ID,
        enableHiding: false,
        enableSorting: false,
        accessorFn: (row: TData) => {
            return row
        },
        header: headerPin ? ActionsPinHeader : ActionsEmptyHeader,
        cell: ActionsCell,
        minSize: 50,
        size: 50,
        ...customActionsColumnProps,
    }
    const rowActions: RowActionsOptions<TData> = { actions, customActionsNode, rowHeight, rowActionsState }

    return Object.assign(column, { [ROW_ACTIONS]: rowActions })
}
