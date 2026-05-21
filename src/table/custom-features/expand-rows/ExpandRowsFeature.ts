import {
    functionalUpdate,
    makeStateUpdater,
    type Row,
    type RowData,
    type Table,
    type TableFeature,
    type Updater,
} from '@tanstack/react-table'
import type { ExpandedRowsOptions, ExpandedRowsTableState } from './types'

export const ExpandedRowsFeature: TableFeature = {
    getInitialState: (state): ExpandedRowsTableState => {
        return {
            expandedRows: new Set(),
            ...state,
        }
    },

    getDefaultOptions: <TData extends RowData>(table: Table<TData>): ExpandedRowsOptions => {
        return {
            onChangeExpandedRows: makeStateUpdater('expandedRows', table),
        } as ExpandedRowsOptions
    },

    createTable: <TData extends RowData>(table: Table<TData>): void => {
        table.setExpandedRows = (updater) => {
            const safeUpdater: Updater<Set<string>> = (old) => {
                const newState = functionalUpdate(updater, old)
                return newState
            }

            return table.options.onChangeExpandedRows?.(safeUpdater)
        }
    },

    createRow: <TData extends RowData>(row: Row<TData>, table: Table<TData>): void => {
        row.onChangeExpanded = (newExpanded) => {
            const safeUpdater: Updater<Set<string>> = (old) => {
                const newExpandedRows = new Set(old)

                const id = row.id
                newExpanded ? newExpandedRows.add(id) : newExpandedRows.delete(id)
                const newState = functionalUpdate(() => newExpandedRows, old)
                return newState
            }

            return table.setExpandedRows(safeUpdater)
        }

        row.isExpanded = () => table.getState().expandedRows.has(row.id)
        row.toggleExpand = () => {
            const isExpanded = row.isExpanded()
            row.onChangeExpanded(!isExpanded)
        }
    },
}
