import type { Column, Table } from '@tanstack/react-table'
import { INTERNAL_COLUMN_IDS } from 'src/table/types'

const leafIdsInDefinitionOrder = <TData>(columns: Column<TData, unknown>[]): string[] =>
    columns.flatMap((column) => (column.columns.length ? leafIdsInDefinitionOrder(column.columns) : [column.id]))

/**
 * The leaf column ids of the table's current column definitions, in definition order (group columns
 * flattened). Read live on every call: the column definitions may change while the table stays mounted, so
 * a default captured once would go stale (ASMA-8597, trap A).
 */
export const getDefinitionColumnOrder = <TData>(table: Table<TData>): string[] =>
    leafIdsInDefinitionOrder(table.getAllColumns())

/** The leaf column ids as the table shows them now, with the saved column order applied. */
export const getEffectiveColumnOrder = <TData>(table: Table<TData>): string[] =>
    table.getAllLeafColumns().map((column) => column.id)

const sameIds = (left: string[], right: string[]): boolean =>
    left.length === right.length && left.every((id, index) => id === right[index])

/** `true` when no column has been moved away from its definition position. */
export const isDefaultColumnOrder = <TData>(table: Table<TData>): boolean =>
    sameIds(getEffectiveColumnOrder(table), getDefinitionColumnOrder(table))

/** The columns the column settings popover lists: no internal columns, and only those with a header. */
const isPopoverColumn = <TData>(column: Column<TData, unknown>): boolean =>
    !INTERNAL_COLUMN_IDS.includes(column.id) && !!column.columnDef.header

/**
 * `true` when the user has moved a column the popover lists. It compares the popover's columns in their
 * effective order with the same columns in definition order, so a stored order that matches the current
 * definitions shows nothing, and a column that disappeared from `columns` does not count as a move.
 */
export const hasReorderedColumns = <TData>(table: Table<TData>): boolean => {
    const popoverColumnIds = new Set(table.getAllLeafColumns().filter(isPopoverColumn).map((column) => column.id))

    return !sameIds(
        getEffectiveColumnOrder(table).filter((id) => popoverColumnIds.has(id)),
        getDefinitionColumnOrder(table).filter((id) => popoverColumnIds.has(id)),
    )
}

/** `true` when a column the user may hide is hidden. Internal columns and columns fixed visible don't count. */
export const hasHiddenColumns = <TData>(table: Table<TData>): boolean =>
    table
        .getAllLeafColumns()
        .some((column) => column.getCanHide() && !column.getIsVisible() && !INTERNAL_COLUMN_IDS.includes(column.id))

/**
 * Whether the user's column layout differs from the table's defaults: a hidden column or a moved one. This
 * is what the dot on the column settings pin shows (ASMA-8597, Q9, Q10). Widths and sorting never count.
 */
export const hasChangedColumnLayout = <TData>(table: Table<TData>): boolean =>
    hasHiddenColumns(table) || hasReorderedColumns(table)
