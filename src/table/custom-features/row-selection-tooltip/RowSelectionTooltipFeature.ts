import type { Row, RowData, Table, TableFeature } from '@tanstack/react-table'

export const RowSelectionTooltipFeature: TableFeature = {
    createRow: <TData extends RowData>(row: Row<TData>, table: Table<TData>): void => {
        row.getRowSelectionTooltip = () => table.options.getRowSelectionTooltip?.(row)
    },
}
