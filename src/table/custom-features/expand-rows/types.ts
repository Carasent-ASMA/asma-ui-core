import type { OnChangeFn, Updater } from '@tanstack/react-table'

export interface ExpandedRowsTableState {
    expandedRows: Set<string>
}

export interface ExpandedRow {
    toggleExpand: () => void
    onChangeExpanded: (newExpanded: boolean) => void

    isExpanded: () => boolean
}

export interface ExpandedRowsOptions {
    onChangeExpandedRows?: OnChangeFn<Set<string>>
}

export interface ExpandedRowsInstance {
    setExpandedRows: (updater: Updater<Set<string>>) => void
}
