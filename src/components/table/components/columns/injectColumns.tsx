import { selectColumn } from './selectColumn'
import { generateExpandColumn } from './expandColumn'
import { generateActionsColumn } from './action-column/actionColumn'
import { EXPAND_COLUMN_ID, SELECT_COLUMN_ID, type StyledTableProps } from '../../types'

export function injectColumns<TData>({
    columns,
    expandArrow,
    enableRowSelection,
    headerPin,
    actions,
    customActionsNode,
}: Omit<StyledTableProps<TData, TData>, 'data'>) {
    if (!columns.find((col) => col.id === 'actions')) {
        columns.push(
            generateActionsColumn({
                headerPin: headerPin || false,
                actions,
                customActionsNode,
            }),
        )
    }

    if (expandArrow && !columns.find((col) => col.id === EXPAND_COLUMN_ID)) {
        columns.unshift(generateExpandColumn())
    }

    if (enableRowSelection && !columns.find((col) => col.id === SELECT_COLUMN_ID)) {
        columns.unshift(selectColumn())
    }
}
