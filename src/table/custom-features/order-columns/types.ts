import type { ColumnOrderState, OnChangeFn } from '@tanstack/react-table'

export interface OrderedColumnsTableState {
    columnOrder: ColumnOrderState
}

export interface OrderedColumnsOptions {
    onColumnOrderChange?: OnChangeFn<ColumnOrderState>
    persistColumnOrderKey?: string
}
