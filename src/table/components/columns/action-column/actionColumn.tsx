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

    return {
        id: ACTIONS_COLUMN_ID,
        enableHiding: false,
        enableSorting: false,
        accessorFn: (row: TData) => {
            return row
        },
        header: headerPin ? ActionsPinHeader : ActionsEmptyHeader,
        cell: (cell: CellContext<TData, unknown>) =>
            actions || customActionsNode ? (
                <div
                    className={'flex items-center justify-end gap-x-1'}
                    style={{ height: rowHeight ?? 'auto' }}
                >
                    {customActionsNode && <div>{customActionsNode?.(cell)}</div>}
                    {actions && <RowActionMenu tableData={cell} actions={actions} rowActionsState={rowActionsState} />}
                </div>
            ) : null,
        minSize: 50,
        size: 50,
        ...customActionsColumnProps,
    }
}
