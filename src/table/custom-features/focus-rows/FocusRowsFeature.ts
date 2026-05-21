import {
    functionalUpdate,
    makeStateUpdater,
    type Row,
    type RowData,
    type Table,
    type TableFeature,
    type Updater,
} from '@tanstack/react-table'
import type { FocusedRowsOptions, FocusedRowsTableState } from './types'

export const FocusedRowsFeature: TableFeature = {
    getInitialState: (state): FocusedRowsTableState => {
        return {
            focusedRow: null,
            ...state,
        }
    },

    getDefaultOptions: <TData extends RowData>(table: Table<TData>): FocusedRowsOptions => {
        return {
            onChangeFocusedRow: makeStateUpdater('focusedRow', table),
        } as FocusedRowsOptions
    },

    createTable: <TData extends RowData>(table: Table<TData>): void => {
        table.setFocusedRow = (updater) => {
            const safeUpdater: Updater<string | null> = (old) => {
                const newState = functionalUpdate(updater, old)
                return newState
            }

            return table.options.onChangeFocusedRow?.(safeUpdater)
        }

        table.focusRowById = async (rowId: string) => {
            const rowIndex = table.getRowModel().rows.findIndex((r) => r.id === rowId)

            // If row is not in the current page, change the page first
            if (rowIndex === -1 && table.getState().pagination) {
                // Calculate the page containing the row
                const pageSize = table.getState().pagination.pageSize
                const rowPos = table.getCoreRowModel().rows.findIndex((r) => r.id === rowId)
                if (rowPos !== -1) {
                    const pageIndex = Math.floor(rowPos / pageSize)
                    table.setPageIndex?.(pageIndex)
                }
            }

            // Wait for DOM update (next tick)
            await new Promise(requestAnimationFrame)

            const row = table.getRowModel().rows.find((r) => r.id === rowId)
            if (!row) return

            // Set focus state
            table.setFocusedRow(() => rowId)

            // Scroll DOM element into view
            const el = document.getElementById(rowId)
            if (el) {
                el.focus({ preventScroll: false })
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }
    },

    createRow: <TData extends RowData>(row: Row<TData>, table: Table<TData>): void => {
        // Focus state
        row.isFocused = () => table.getState().focusedRow === row.id

        row.onChangeFocused = (newFocused: boolean, rowId?: string) => {
            const idToFocus = rowId ?? row.id
            table.setFocusedRow(() => (newFocused ? idToFocus : null))

            if (newFocused) {
                const el = document.getElementById(idToFocus)
                if (el) {
                    el.focus({ preventScroll: true })
                }
            }
        }

        row.toggleFocused = () => row.onChangeFocused(!row.isFocused())

        // Arrow navigation
        row.focusNextRow = () => {
            const allRows = table.getRowModel().rows
            const currentIndex = allRows.findIndex((r) => r.id === table.getState().focusedRow)
            const nextRow = allRows[currentIndex + 1]
            if (nextRow) {
                nextRow.onChangeFocused(true, nextRow.id)
                document.getElementById(nextRow.id)?.focus({ preventScroll: true })
            }
        }

        row.focusPrevRow = () => {
            const allRows = table.getRowModel().rows
            const currentIndex = allRows.findIndex((r) => r.id === table.getState().focusedRow)
            const prevRow = allRows[currentIndex - 1]
            if (prevRow) {
                prevRow.onChangeFocused(true, prevRow.id)
                document.getElementById(prevRow.id)?.focus({ preventScroll: true })
            }
        }
    },
}
