import type { ColumnOrderState, OnChangeFn, VisibilityState } from '@tanstack/react-table'

export interface OrderedColumnsTableState {
    columnOrder: ColumnOrderState
}

export interface OrderedColumnsOptions {
    onColumnOrderChange?: OnChangeFn<ColumnOrderState>
    /**
     * Saves the column order under this key, unscoped: every user of a browser shares it, so give it only to a table that
     * has no per-user option. A table with `persistColumnLayout` (ASMA-8695) saves the order under its own `uniqueKey`
     * instead, and reads this key once, as the old entry to migrate, and then deletes it.
     */
    persistColumnOrderKey?: string
}

/** The layout a table opens with when it has no saved one: what the app's `initialState` declares (ASMA-8695). */
export interface ColumnLayoutDefaults {
    /** `initialState.columnOrder`; `[]` is the definition order. */
    order: ColumnOrderState
    /** The whole visibility state a table opens with, internal columns included; a column it does not list is visible. */
    visibility: VisibilityState
}

export interface ColumnSettingsInstance {
    /**
     * Reset columns (ASMA-8597): puts the column order and the widths back to the table's defaults, and the
     * sorting too when the table has `persistSorting`. It removes the saved entries of what it resets. On a table
     * with `persistColumnLayout` (ASMA-8695, OQ-02) it also puts the visibility back to the default, unhiding what
     * the user hid and hiding what is hidden by default; any other table never touches visibility. Set by
     * `StyledTable`, which knows the defaults.
     */
    resetColumnSettings: () => void
    /**
     * Set by `StyledTable` on every render for a table with `persistColumnLayout`, and `undefined` for any other table
     * (ASMA-8695, DEC-05): the column settings dot compares the layout with these defaults only where ui-core knows
     * them. Some apps pass the user's current visibility as `initialState`, so elsewhere it cannot.
     */
    columnLayoutDefaults?: ColumnLayoutDefaults | undefined
}
