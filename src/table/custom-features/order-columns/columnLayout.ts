import type { Column, ColumnOrderState, Table, VisibilityState } from '@tanstack/react-table'
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

/**
 * The order the table shows for a `columnOrder` state, the way TanStack applies it: the listed columns that exist, in the
 * listed order, then every other column in definition order. `[]` is the definition order.
 */
export const effectiveColumnOrder = (order: ColumnOrderState, definitionIds: readonly string[]): string[] => {
    const present = new Set(definitionIds)
    const listed = [...new Set(order)].filter((id) => present.has(id))
    const listedSet = new Set(listed)

    return [...listed, ...definitionIds.filter((id) => !listedSet.has(id))]
}

/**
 * ASMA-8695, DEC-03: puts every column that a saved order does not list at its definition position, not at the end, which is
 * where TanStack puts it. Each missing column goes right after the closest column before it in the definition that the order
 * lists; with none before it, right before the closest one after it; with none at all, at the end. Ids that no column has are
 * kept, so an order saved for columns that are not there at the moment survives (ASMA-8597, DEC-W).
 */
export const insertMissingColumns = (order: readonly string[], definitionIds: readonly string[]): string[] => {
    const result = [...order]

    definitionIds.forEach((id, index) => {
        if (result.includes(id)) return

        const previous = definitionIds.slice(0, index).findLast((candidate) => result.includes(candidate))
        const next = definitionIds.slice(index + 1).find((candidate) => result.includes(candidate))

        if (previous !== undefined) result.splice(result.indexOf(previous) + 1, 0, id)
        else if (next !== undefined) result.splice(result.indexOf(next), 0, id)
        else result.push(id)
    })

    return result
}

/** A column that has no entry in a visibility state is visible. */
const isVisibleIn = (visibility: VisibilityState, id: string): boolean => visibility[id] ?? true

/**
 * What a `columnVisibility` state changes from the defaults: only the columns whose visibility differs, never an internal
 * column (the select column is hidden unless the app shows it, and is not the user's to change). This is what a table saves
 * (ASMA-8695, DEC-02), and a state with no difference is the default.
 */
export const diffColumnVisibility = (state: VisibilityState, defaults: VisibilityState): Record<string, boolean> =>
    Object.fromEntries(
        Object.entries(state).filter(
            ([id, visible]) => !INTERNAL_COLUMN_IDS.includes(id) && visible !== isVisibleIn(defaults, id),
        ),
    )

/** Same differences in any key order count as the same visibility. */
export const columnVisibilitySignature = (state: VisibilityState, defaults: VisibilityState): string =>
    JSON.stringify(Object.entries(diffColumnVisibility(state, defaults)).sort(([left], [right]) => (left < right ? -1 : 1)))

/** `true` when no column has been moved away from its definition position. */
export const isDefaultColumnOrder = <TData>(table: Table<TData>): boolean =>
    sameIds(getEffectiveColumnOrder(table), getDefinitionColumnOrder(table))

/** The columns the column settings popover lists: no internal columns, and only those with a header. */
const isPopoverColumn = <TData>(column: Column<TData, unknown>): boolean =>
    !INTERNAL_COLUMN_IDS.includes(column.id) && !!column.columnDef.header

/**
 * `true` when the user has moved a column the popover lists. It compares the popover's columns in their
 * effective order with the same columns in the default order, so a stored order that matches the current
 * definitions shows nothing, and a column that disappeared from `columns` does not count as a move. The default order is the
 * definition order, or on a table with `persistColumnLayout` the one its `initialState.columnOrder` declares (ASMA-8695).
 */
export const hasReorderedColumns = <TData>(table: Table<TData>): boolean => {
    const popoverColumnIds = new Set(table.getAllLeafColumns().filter(isPopoverColumn).map((column) => column.id))
    const defaultOrder = effectiveColumnOrder(table.columnLayoutDefaults?.order ?? [], getDefinitionColumnOrder(table))

    return !sameIds(
        getEffectiveColumnOrder(table).filter((id) => popoverColumnIds.has(id)),
        defaultOrder.filter((id) => popoverColumnIds.has(id)),
    )
}

/**
 * `true` when the user's visibility is not the default. A table with `persistColumnLayout` knows its defaults, so a column
 * hidden by default is no change, while showing it, or hiding a column that is shown by default, is (ASMA-8695, Q10,
 * DEC-05). Any other table has no known defaults, so a hidden column the user may hide is the change, as before. Internal
 * columns and columns fixed visible never count.
 */
export const hasHiddenColumns = <TData>(table: Table<TData>): boolean => {
    const defaults = table.columnLayoutDefaults?.visibility

    return table
        .getAllLeafColumns()
        .some(
            (column) =>
                column.getCanHide() &&
                !INTERNAL_COLUMN_IDS.includes(column.id) &&
                (defaults ? column.getIsVisible() !== isVisibleIn(defaults, column.id) : !column.getIsVisible()),
        )
}

/**
 * Whether the user's column layout differs from the table's defaults: a hidden column or a moved one. This
 * is what the dot on the column settings pin shows (ASMA-8597, Q9, Q10). Widths and sorting never count.
 */
export const hasChangedColumnLayout = <TData>(table: Table<TData>): boolean =>
    hasHiddenColumns(table) || hasReorderedColumns(table)
