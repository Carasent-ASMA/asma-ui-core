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

const isSticky = (element: Element): boolean => getComputedStyle(element).position === 'sticky'

/**
 * Scroll a focused row just far enough to be fully visible (WCAG 2.4.11 Focus Not Obscured), clear of
 * the sticky header above it and of what sticks to the bottom of the table — the horizontal scrollbar
 * and the short-table footer, the siblings after the table's block. `scroll-margin` is how
 * `scrollIntoView` keeps clear of them; `nearest` scrolls only when the row is not already in view and
 * leaves a horizontally scrolled table where it is.
 */
const scrollRowIntoView = (row: HTMLElement): void => {
    const table = row.closest('table')
    const head = table?.tHead
    let bottom = 0
    for (let element = table?.parentElement?.nextElementSibling; element; element = element.nextElementSibling) {
        if (isSticky(element)) bottom += element.getBoundingClientRect().height
    }

    row.style.scrollMarginTop = `${head && isSticky(head) ? head.getBoundingClientRect().height : 0}px`
    row.style.scrollMarginBottom = `${bottom}px`
    row.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

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
        }
    },

    createTable: <TData extends RowData>(table: Table<TData>): void => {
        table.setFocusedRow = (updater) => {
            const safeUpdater: Updater<string | null> = (old) => {
                const newState = functionalUpdate(updater, old)
                return newState
            }

            return table.options.onChangeFocusedRow?.(safeUpdater)
        }

        const focusRowByIdAsync = async (rowId: string): Promise<void> => {
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

        // `focusRowById` is typed `(rowId: string) => void` (fire-and-forget, no caller awaits it) —
        // the async body above is wrapped rather than assigned directly, so the property itself stays
        // a synchronous void function and the unawaited promise is explicit (`void`), not implicit.
        table.focusRowById = (rowId: string): void => {
            void focusRowByIdAsync(rowId)
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
                    // The browser's own focus scroll ignores the sticky header, so scroll here instead.
                    el.focus({ preventScroll: true })
                    scrollRowIntoView(el)
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
                return true
            }
            return false
        }

        row.focusPrevRow = () => {
            const allRows = table.getRowModel().rows
            const currentIndex = allRows.findIndex((r) => r.id === table.getState().focusedRow)
            const prevRow = allRows[currentIndex - 1]
            if (prevRow) {
                prevRow.onChangeFocused(true, prevRow.id)
                return true
            }
            return false
        }
    },
}
