import type { ColumnOrderState, OnChangeFn } from '@tanstack/react-table'

export interface OrderedColumnsTableState {
    columnOrder: ColumnOrderState
}

export interface OrderedColumnsOptions {
    onColumnOrderChange?: OnChangeFn<ColumnOrderState>
    persistColumnOrderKey?: string
}

export interface ColumnSettingsInstance {
    /**
     * Reset columns (ASMA-8597): puts the column order and the widths back to the table's defaults, and the
     * sorting too when the table has `persistSorting`. It never unhides columns, and it removes the saved
     * entries of what it resets. Set by `StyledTable`, which knows the defaults.
     */
    resetColumnSettings: () => void
}
