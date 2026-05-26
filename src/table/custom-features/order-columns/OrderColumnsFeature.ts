import {
    functionalUpdate,
    makeStateUpdater,
    type Table,
    type TableFeature,
    type RowData,
    type Updater,
    type ColumnOrderState,
} from '@tanstack/react-table'
import type { OrderedColumnsOptions, OrderedColumnsTableState } from './types'

export const OrderColumnsFeature: TableFeature = {
    getInitialState: (state): OrderedColumnsTableState => {
        return {
            columnOrder: [],
            ...state,
        }
    },
    getDefaultOptions: <TData extends RowData>(table: Table<TData>): OrderedColumnsOptions => {
        return {
            onColumnOrderChange: makeStateUpdater('columnOrder', table),
        }
    },
    createTable: <TData extends RowData>(table: Table<TData>): void => {
        const defaultColumnOrder = table.getAllLeafColumns().map((col) => col.id)

        table.setColumnOrder = (updater: Updater<ColumnOrderState>) => {
            const safeUpdater: Updater<ColumnOrderState> = (old) => functionalUpdate(updater, old)

            return table.options.onColumnOrderChange?.(safeUpdater)
        }

        table.resetColumnOrder = () => {
            table.setColumnOrder(defaultColumnOrder)
        }
    },
}
