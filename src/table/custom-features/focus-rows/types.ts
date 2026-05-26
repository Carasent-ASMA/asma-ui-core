import type { OnChangeFn, Updater } from '@tanstack/react-table'

export interface FocusedRowsTableState {
    focusedRow: string | null
}

export interface FocusedRow {
    toggleFocused: () => void
    onChangeFocused: (newExpanded: boolean, rowId?: string) => void

    isFocused: () => boolean
    focusNextRow: () => void
    focusPrevRow: () => void
}

export interface FocusedRowsOptions {
    onChangeFocusedRow?: OnChangeFn<string | null>
}

export interface FocusedRowsInstance {
    setFocusedRow: (updater: Updater<string | null>) => void
    focusRowById: (rowId: string) => void
}
