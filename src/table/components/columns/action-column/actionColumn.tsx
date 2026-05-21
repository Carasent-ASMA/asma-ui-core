import type { CellContext, HeaderContext, Row } from '@tanstack/react-table'
import { RowActionMenu } from './components/RowActionMenu'
import { HeaderActionMenu } from './components/HeaderActionMenu'
import type { ReactNode } from 'react'
import { ACTIONS_COLUMN_ID, type ColumnDef, type IAction, type ICustomAction, type RowActionsState } from 'src/table/types'

export function generateActionsColumn<TData>(options: {
    headerPin: boolean
    actions?: (row: Row<TData>) => (IAction<TData> | ICustomAction<TData>)[]
    customActionsNode?: (row: CellContext<TData, TData>) => ReactNode
    rowHeight?: number
    customActionsColumnProps?: Partial<ColumnDef<TData, unknown>>
    rowActionsState?: (row: Row<TData>) => RowActionsState | undefined
    locale?: 'en' | 'no'
}): ColumnDef<TData, unknown> {
    const { headerPin, actions, customActionsNode, rowHeight, customActionsColumnProps, rowActionsState, locale } =
        options

    return {
        id: ACTIONS_COLUMN_ID,
        enableHiding: false,
        enableSorting: false,
        accessorFn: (row: TData) => {
            return row
        },
        header: (props: HeaderContext<TData, TData>) => {
            return headerPin ? <HeaderActionMenu headerData={props} locale={locale} /> : null
        },
        cell: (cell: CellContext<TData, TData>) =>
            actions || customActionsNode ? (
                <div
                    className={'flex items-center justify-end gap-x-1'}
                    style={{ height: rowHeight ?? 'auto' }}
                >
                    {customActionsNode && <div>{customActionsNode?.(cell)}</div>}
                    {actions && <RowActionMenu tableData={cell} actions={actions} rowActionsState={rowActionsState} />}
                </div>
            ) : null,
        size: 50,
        ...customActionsColumnProps,
    }
}
