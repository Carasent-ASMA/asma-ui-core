import type { OnChangeFn, Updater } from '@tanstack/react-table'

export interface FocusedRowsTableState {
    focusedRow: string | null
}

export interface FocusedRow {
    toggleFocused: () => void
    onChangeFocused: (newExpanded: boolean, rowId?: string) => void

    isFocused: () => boolean
    focusNextRow: () => boolean
    focusPrevRow: () => boolean
    /**
     * Makes this row the roving tab stop without moving the focus: a control in it took the focus (ASMA-8875), so Tab
     * comes back to this row.
     */
    takeTabStop: () => void
}

export interface FocusedRowsOptions {
    onChangeFocusedRow?: OnChangeFn<string | null>
}

export interface FocusedRowsInstance {
    setFocusedRow: (updater: Updater<string | null>) => void
    focusRowById: (rowId: string) => void
}
