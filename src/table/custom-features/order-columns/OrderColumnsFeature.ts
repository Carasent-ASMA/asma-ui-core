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
            ...state,
            columnOrder: state?.columnOrder ?? [],
        }
    },
    getDefaultOptions: <TData extends RowData>(table: Table<TData>): OrderedColumnsOptions => {
        return {
            onColumnOrderChange: makeStateUpdater('columnOrder', table),
        }
    },
    createTable: <TData extends RowData>(table: Table<TData>): void => {
        table.setColumnOrder = (updater: Updater<ColumnOrderState>) => {
            const safeUpdater: Updater<ColumnOrderState> = (old) => functionalUpdate(updater, old)

            return table.options.onColumnOrderChange?.(safeUpdater)
        }

        // `[]` means "the definition order of the columns as they are now". A list captured when the table
        // was created would go stale as soon as `columns` changes (ASMA-8597, trap A).
        table.resetColumnOrder = () => {
            table.setColumnOrder([])
        }
    },
}
