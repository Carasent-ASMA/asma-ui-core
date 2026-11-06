import { useEffect, useLayoutEffect, useMemo } from 'react'
import type { ColumnOrderState, Table, VisibilityState } from '@tanstack/react-table'
import { INTERNAL_COLUMN_IDS } from '../types'
import { readJson, tableStorage } from '../helpers/tableStorage'
import type { LeafColumnInfo } from '../helpers/columnIds'
import {
    columnVisibilitySignature,
    diffColumnVisibility,
    effectiveColumnOrder,
    getDefinitionColumnOrder,
    insertMissingColumns,
} from '../custom-features/order-columns/columnLayout'
import { usePersistedStateWriter } from './usePersistedStateWriter'

/**
 * Per-user column order and visibility (ASMA-8695), saved only by a table that opts in with `persistColumnLayout`.
 *
 * - `${uniqueKey}:column-order` = `{"v":1,"order":["<id>",…]}`
 * - `${uniqueKey}:column-visibility` = `{"v":1,"visibility":{"<id>":<boolean>}}`, only the columns whose visibility differs
 *   from the default, never an internal column.
 *
 * Both follow ASMA-8597's rules (`usePersistedStateWriter`): a state equal to the default removes the entry, mounting and
 * loading a key never write, a key change loads the new key's values, no key means the defaults, and a storage that fails
 * leaves the table working (`tableStorage`).
 */

const ORDER_KEY_SUFFIX = ':column-order'
const VISIBILITY_KEY_SUFFIX = ':column-visibility'
const FORMAT_VERSION = 1

export const getColumnOrderStorageKey = (uniqueKey?: string): string | undefined =>
    uniqueKey ? `${uniqueKey}${ORDER_KEY_SUFFIX}` : undefined

export const getColumnVisibilityStorageKey = (uniqueKey?: string): string | undefined =>
    uniqueKey ? `${uniqueKey}${VISIBILITY_KEY_SUFFIX}` : undefined

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

const uniqueStrings = (values: readonly unknown[]): string[] => [
    ...new Set(values.filter((value): value is string => typeof value === 'string')),
]

/**
 * Checks a parsed `:column-order` value. Ids that no column has are kept: an order saved for columns that are not there at
 * the moment survives, and TanStack ignores them (ASMA-8597, DEC-W). `undefined` means nothing usable is saved.
 */
export const sanitizeColumnOrder = (raw: unknown): string[] | undefined => {
    if (!isRecord(raw) || raw['v'] !== FORMAT_VERSION || !Array.isArray(raw['order'])) return undefined

    const order = uniqueStrings(raw['order'])

    return order.length > 0 ? order : undefined
}

/**
 * A visibility entry for an id is kept unless it names an internal column or a column that cannot hide. An id that no column
 * has is kept: a column that appears later picks up its saved state, as a saved order and saved widths do (ASMA-8597, DEC-W).
 * Only the id of a column that is there, and cannot hide, is dropped (ASMA-8695, DEC-02).
 */
const keepsVisibilityOf = (id: string, columns: readonly LeafColumnInfo[]): boolean =>
    !INTERNAL_COLUMN_IDS.includes(id) && columns.find((column) => column.id === id)?.canHide !== false

/**
 * Checks a parsed `:column-visibility` value and returns the valid differences, or `undefined` when nothing usable is saved.
 * Values that are not booleans are dropped, and so are the ids of internal columns and of columns that cannot hide; **ids of
 * columns that are not there at the moment are kept** (DEC-W).
 */
export const sanitizeColumnVisibility = (
    raw: unknown,
    columns: readonly LeafColumnInfo[],
): Record<string, boolean> | undefined => {
    if (!isRecord(raw) || raw['v'] !== FORMAT_VERSION || !isRecord(raw['visibility'])) return undefined

    const visibility = Object.fromEntries(
        Object.entries(raw['visibility']).filter(
            (entry): entry is [string, boolean] => typeof entry[1] === 'boolean' && keepsVisibilityOf(entry[0], columns),
        ),
    )

    return Object.keys(visibility).length > 0 ? visibility : undefined
}

/** The old `persistColumnOrderKey` entry: a raw array of column ids, with no version. */
const parseLegacyOrder = (raw: unknown): string[] | undefined => {
    if (!Array.isArray(raw)) return undefined

    const order = uniqueStrings(raw)

    return order.length > 0 ? order : undefined
}

/**
 * The old visibility entry, as every app hook wrote it (D-MIGRATE): a raw, unversioned `{ [columnId]: boolean }` map of the
 * whole visibility state. It is not checked against the versioned shape. A plain object whose values are all booleans is
 * mapped to the differences from the defaults, without internal columns and columns that cannot hide; anything else is not a
 * visibility and is not migrated. `undefined` means nothing to carry over.
 */
const parseLegacyVisibility = (
    raw: unknown,
    columns: readonly LeafColumnInfo[],
    defaults: VisibilityState,
): Record<string, boolean> | undefined => {
    if (!isRecord(raw) || !Object.values(raw).every((visible) => typeof visible === 'boolean')) return undefined

    const kept = Object.fromEntries(Object.entries(raw).filter(([id]) => keepsVisibilityOf(id, columns)) as [string, boolean][])
    const changes = diffColumnVisibility(kept, defaults)

    return Object.keys(changes).length > 0 ? changes : undefined
}

interface SavedColumnLayoutOptions {
    /** `persistColumnLayout`. */
    enabled: boolean
    uniqueKey: string | undefined
    /** `persistColumnOrderKey`: where the order used to be saved, unscoped. */
    legacyOrderKey: string | undefined
    legacyVisibilityKey: string | undefined
    /** The leaf columns of this render, in definition order. */
    columns: readonly LeafColumnInfo[]
    /** `initialState.columnOrder`, or `[]`. */
    defaultOrder: ColumnOrderState
    /** The whole visibility state the table opens with. */
    defaultVisibility: VisibilityState
}

/** One old entry to migrate: it is deleted only once the new entry that replaces it is written, or when nothing replaces it. */
interface MigrationItem {
    legacyKey: string
    /** The entry that takes over the old layout; absent when the old value is invalid or equals the default. */
    write?: { key: string; value: string }
}

/** What was read for the table's current key, as read: missing columns are not placed yet, and the defaults are not applied. */
interface RawSavedColumnLayout {
    orderKey: string | undefined
    visibilityKey: string | undefined
    order: string[] | undefined
    /** The saved visibility differences from the defaults. */
    visibility: Record<string, boolean> | undefined
    /** What the one-time migration of the old entries changes in storage; applied once, in an effect. */
    migration: MigrationItem[]
}

export interface SavedColumnLayout {
    orderKey: string | undefined
    visibilityKey: string | undefined
    /** The saved order to open with, missing columns at their definition position (DEC-03), for the columns of this render. */
    order: string[] | undefined
    /** The whole visibility state to open with: this render's defaults with the saved differences on top. */
    visibility: VisibilityState | undefined
}

const readSavedColumnLayout = (options: SavedColumnLayoutOptions): RawSavedColumnLayout => {
    const { enabled, uniqueKey, legacyOrderKey, legacyVisibilityKey, columns, defaultOrder, defaultVisibility } = options
    const orderKey = enabled ? getColumnOrderStorageKey(uniqueKey) : undefined
    const visibilityKey = enabled ? getColumnVisibilityStorageKey(uniqueKey) : undefined
    const definitionIds = columns.map((column) => column.id)
    const migration: MigrationItem[] = []
    let order: string[] | undefined
    let visibility: Record<string, boolean> | undefined

    if (orderKey) {
        if (tableStorage.get(orderKey) !== null) {
            order = sanitizeColumnOrder(readJson(orderKey))
        } else if (legacyOrderKey && tableStorage.get(legacyOrderKey) !== null) {
            // The first user who opens the table on this browser takes over the old, shared order (D-MIGRATE). The old entry
            // is deleted once the new one is written, or at once when there is nothing to write (an invalid value, or one
            // equal to the default), so it is never read again.
            const legacy = parseLegacyOrder(readJson(legacyOrderKey))
            const isDefault =
                legacy === undefined ||
                effectiveColumnOrder(insertMissingColumns(legacy, definitionIds), definitionIds).join() ===
                    effectiveColumnOrder(defaultOrder, definitionIds).join()

            if (legacy && !isDefault) order = legacy

            migration.push({
                legacyKey: legacyOrderKey,
                ...(legacy && !isDefault && { write: { key: orderKey, value: JSON.stringify({ v: FORMAT_VERSION, order: legacy }) } }),
            })
        }
    }

    if (visibilityKey) {
        if (tableStorage.get(visibilityKey) !== null) {
            visibility = sanitizeColumnVisibility(readJson(visibilityKey), columns)
        } else if (legacyVisibilityKey && tableStorage.get(legacyVisibilityKey) !== null) {
            visibility = parseLegacyVisibility(readJson(legacyVisibilityKey), columns, defaultVisibility)

            migration.push({
                legacyKey: legacyVisibilityKey,
                ...(visibility && {
                    write: { key: visibilityKey, value: JSON.stringify({ v: FORMAT_VERSION, visibility }) },
                }),
            })
        }
    }

    return { orderKey, visibilityKey, order, visibility, migration }
}

/**
 * The layout to open with, from what was read and the columns and defaults of **this** render: a column that the saved order
 * does not list goes to its definition position (DEC-03), and the saved visibility lands on the current defaults. Derived on
 * every render, so a change of the columns or of the defaults is never left behind in a value read once.
 */
const deriveSavedColumnLayout = (
    raw: RawSavedColumnLayout,
    columns: readonly LeafColumnInfo[],
    defaultVisibility: VisibilityState,
): SavedColumnLayout => {
    const changes =
        raw.visibility &&
        Object.fromEntries(Object.entries(raw.visibility).filter(([id]) => keepsVisibilityOf(id, columns)))

    return {
        orderKey: raw.orderKey,
        visibilityKey: raw.visibilityKey,
        order: raw.order && insertMissingColumns(raw.order, columns.map((column) => column.id)),
        visibility: changes && Object.keys(changes).length > 0 ? { ...defaultVisibility, ...changes } : undefined,
    }
}

/**
 * Reads the saved layout of the table's current key, once per key, and migrates the old unscoped entries once (D-MIGRATE).
 * Reading is pure; the migration's writes and deletes happen in an effect, and are idempotent, so StrictMode's second run
 * changes nothing. **An old entry is deleted only after the entry that replaces it is written**: when storage refuses the
 * write (it is full or blocked) the old layout stays, and the next visit tries again. Needs to run before the table is
 * created, because the saved layout is part of its initial state.
 */
export const useSavedColumnLayout = (options: SavedColumnLayoutOptions): SavedColumnLayout => {
    const orderKey = options.enabled ? getColumnOrderStorageKey(options.uniqueKey) : undefined
    const visibilityKey = options.enabled ? getColumnVisibilityStorageKey(options.uniqueKey) : undefined

    const raw = useMemo(
        () => readSavedColumnLayout(options),
        // Storage is read once per key and legacy key. What the layout is made of (the columns, the defaults) is applied on
        // every render below, so the value read once never goes stale.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [orderKey, visibilityKey, options.legacyOrderKey, options.legacyVisibilityKey],
    )

    useEffect(() => {
        for (const { legacyKey, write } of raw.migration) {
            // Keep the old entry when the new one could not be saved: deleting it would lose the user's layout.
            if (write && !tableStorage.set(write.key, write.value)) continue

            tableStorage.remove(legacyKey)
        }
    }, [raw])

    return deriveSavedColumnLayout(raw, options.columns, options.defaultVisibility)
}

interface ColumnLayoutInputs {
    /** What the table state was last brought in line with. */
    signature: string
    definitionIds: readonly string[]
    defaultOrder: ColumnOrderState
    defaultVisibility: VisibilityState
}

/** The inputs each table's state was last brought in line with, by table instance. */
const reconciledInputs = new WeakMap<object, ColumnLayoutInputs>()

const sameVisibility = (left: VisibilityState, right: VisibilityState): boolean =>
    [...new Set([...Object.keys(left), ...Object.keys(right)])].every((id) => (left[id] ?? true) === (right[id] ?? true))

/**
 * Keeps the table's state in step with the columns and the defaults of the current render (ASMA-8695, audit): the state was
 * created from what the first render knew, and TanStack never revisits it.
 *
 * - **A new column** goes to its definition position in an order the user changed (DEC-03), as it does when a saved order is
 *   read; a user who has not moved anything stays on the definition order.
 * - **A changed default** reaches the user who had not changed that column: the order follows the new `initialState.columnOrder`
 *   while the user is on the old default, and each column's visibility follows the new default unless the user changed it.
 *   What the user changed stays. Without this the dot would show a difference the user never made.
 *
 * Returns `true` for the render in which the state is not yet in step: the writers wait (nothing is saved for a state that is
 * about to change), so a changed default is never saved as the user's choice.
 */
export const useColumnLayoutReconcile = <TData>(
    table: Table<TData>,
    options: {
        enabled: boolean
        definitionIds: readonly string[]
        defaultOrder: ColumnOrderState
        defaultVisibility: VisibilityState
        controlledVisibility: boolean
    },
): boolean => {
    const { enabled, definitionIds, defaultOrder, defaultVisibility, controlledVisibility } = options
    const current: ColumnLayoutInputs = {
        signature: JSON.stringify([definitionIds, defaultOrder, Object.entries(defaultVisibility).sort()]),
        definitionIds,
        defaultOrder,
        defaultVisibility,
    }
    // The inputs of the last commit, kept outside React state: reading them in render is how the writers learn that this
    // render's state is not in step yet, and an update of React state would only repeat the render that finds out.
    const seen = reconciledInputs.get(table) ?? current
    const pending = enabled && seen.signature !== current.signature

    useLayoutEffect(() => {
        const before = reconciledInputs.get(table)

        reconciledInputs.set(table, current)

        if (!enabled || !before || before.signature === current.signature) return

        const order = table.getState().columnOrder
        const wasOnDefault =
            effectiveColumnOrder(order, before.definitionIds).join() ===
            effectiveColumnOrder(before.defaultOrder, before.definitionIds).join()
        const nextOrder = wasOnDefault ? defaultOrder : insertMissingColumns(order, definitionIds)

        // Always, even when the order is the same: the update renders the table once more, and that render is the one in
        // which the writers are told they may write (`reconciling` is false again). Without it a change the user made in the
        // render that found the new inputs, or an entry that now equals a changed default, would wait for some later render.
        table.setColumnOrder(nextOrder)

        if (!controlledVisibility) {
            const visibility = table.getState().columnVisibility
            const nextVisibility = { ...defaultVisibility, ...diffColumnVisibility(visibility, before.defaultVisibility) }

            if (!sameVisibility(nextVisibility, visibility)) table.setColumnVisibility(nextVisibility)
        }
        // Only a change of the inputs reconciles; the closure is that render's.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [table, enabled, current.signature])

    return pending
}

interface ColumnLayoutWriterOptions {
    saved: SavedColumnLayout
    /** `true` in the render that finds new columns or defaults, before the state is brought in line: nothing is written yet. */
    reconciling: boolean
    defaultOrder: ColumnOrderState
    defaultVisibility: VisibilityState
    /** The app owns `state.columnVisibility`: a key change blocks writes but does not set the state itself. */
    controlledVisibility: boolean
}

/** Saves the table's order and visibility under the keys of `saved`, by the storage rule of `usePersistedStateWriter`. */
export const useColumnLayoutWriter = <TData>(table: Table<TData>, options: ColumnLayoutWriterOptions): void => {
    const { saved, reconciling, defaultOrder, defaultVisibility, controlledVisibility } = options
    // Read live: the columns may change while the table stays mounted, so a list taken once would go stale (ASMA-8597, trap A).
    const definitionIds = getDefinitionColumnOrder(table)

    usePersistedStateWriter<ColumnOrderState>({
        storageKey: saved.orderKey,
        state: table.getState().columnOrder,
        defaultValue: defaultOrder,
        saved: saved.order,
        settled: !reconciling,
        // `[]` and the definition order are the same layout, so moving a column back removes the entry.
        toSignature: (order) => JSON.stringify(effectiveColumnOrder(order, definitionIds)),
        toStorage: (order) => JSON.stringify({ v: FORMAT_VERSION, order: uniqueStrings(order) }),
        applyState: (order) => table.setColumnOrder(order),
    })

    usePersistedStateWriter<VisibilityState>({
        storageKey: saved.visibilityKey,
        state: table.getState().columnVisibility,
        defaultValue: defaultVisibility,
        saved: saved.visibility,
        settled: !reconciling,
        controlled: controlledVisibility,
        toSignature: (visibility) => columnVisibilitySignature(visibility, defaultVisibility),
        toStorage: (visibility) =>
            JSON.stringify({ v: FORMAT_VERSION, visibility: diffColumnVisibility(visibility, defaultVisibility) }),
        applyState: (visibility) => table.setColumnVisibility(visibility),
    })
}
