import { type CellContext, type HeaderContext, type Row } from '@tanstack/react-table'
import { RowActionMenu } from './components/RowActionMenu'
import { HeaderActionMenu } from './components/HeaderActionMenu'

export function generateActionsColumn<TData>(options: {
    headerPin: boolean
    actions?: (row: Row<TData>) => {
        label: string
        className?: string
        disabled?: boolean
        hide?: boolean
        onClick?: (row: Row<TData>) => void
    }[]
}) {
    const { headerPin, actions } = options

    return {
        id: 'actions',
        enableHiding: false,
        enableSorting: false,
        accessorFn: (row: TData) => {
            return row
        },
        header: (props: HeaderContext<TData, TData>) => {
            return headerPin ? <HeaderActionMenu headerData={props} /> : null
        },
        cell: (row: CellContext<TData, TData>) =>
            actions ? <RowActionMenu tableData={row} actions={actions} /> : null,
        size: 50,
    }
}
