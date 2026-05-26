import type { Row, RowData } from '@tanstack/react-table'
import type { ReactNode } from 'react'

export interface RowSelectionTooltipOptions<TData extends RowData> {
    getRowSelectionTooltip?: (row: Row<TData>) => ReactNode
}

export interface RowSelectionTooltipRow<TData extends RowData> {
    getRowSelectionTooltip: () => ReturnType<NonNullable<RowSelectionTooltipOptions<TData>['getRowSelectionTooltip']>>
}
