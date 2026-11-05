import { useEffect, useMemo } from 'react'
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

/** A visibility entry for an id is kept unless it is not a boolean, names an internal column, or names a column that cannot hide. */
const keepsVisibilityOf = (id: string, columns: readonly LeafColumnInfo[]): boolean =>
    !INTERNAL_COLUMN_IDS.includes(id) && columns.find((column) => column.id === id)?.canHide !== false

/** Checks a parsed `:column-visibility` value and returns the valid differences, or `undefined` when nothing usable is saved. */
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

export interface SavedColumnLayout {
    orderKey: string | undefined
    visibilityKey: string | undefined
    /** The saved order to open with, missing columns already at their definition position (DEC-03). */
    order: string[] | undefined
    /** The whole visibility state to open with: the defaults with the saved differences on top. */
    visibility: VisibilityState | undefined
    /** What the one-time migration of the old entries changes in storage; applied once, in an effect. */
    migration: { writes: [key: string, value: string][]; removes: string[] }
}

const readSavedColumnLayout = (options: SavedColumnLayoutOptions): SavedColumnLayout => {
    const { enabled, uniqueKey, legacyOrderKey, legacyVisibilityKey, columns, defaultOrder, defaultVisibility } = options
    const orderKey = enabled ? getColumnOrderStorageKey(uniqueKey) : undefined
    const visibilityKey = enabled ? getColumnVisibilityStorageKey(uniqueKey) : undefined
    const definitionIds = columns.map((column) => column.id)
    const migration: SavedColumnLayout['migration'] = { writes: [], removes: [] }
    let order: string[] | undefined
    let visibility: VisibilityState | undefined

    if (orderKey) {
        if (tableStorage.get(orderKey) !== null) {
            order = sanitizeColumnOrder(readJson(orderKey))
        } else if (legacyOrderKey && tableStorage.get(legacyOrderKey) !== null) {
            // The first user who opens the table on this browser takes over the old, shared order (D-MIGRATE); the old
            // entry is deleted either way, so it is never read again, and an invalid one is not migrated.
            migration.removes.push(legacyOrderKey)

            const legacy = parseLegacyOrder(readJson(legacyOrderKey))
            const isDefault =
                legacy === undefined ||
                effectiveColumnOrder(insertMissingColumns(legacy, definitionIds), definitionIds).join() ===
                    effectiveColumnOrder(defaultOrder, definitionIds).join()

            if (legacy && !isDefault) {
                order = legacy
                migration.writes.push([orderKey, JSON.stringify({ v: FORMAT_VERSION, order: legacy })])
            }
        }

        if (order) order = insertMissingColumns(order, definitionIds)
    }

    if (visibilityKey) {
        let changes: Record<string, boolean> | undefined

        if (tableStorage.get(visibilityKey) !== null) {
            changes = sanitizeColumnVisibility(readJson(visibilityKey), columns)
        } else if (legacyVisibilityKey && tableStorage.get(legacyVisibilityKey) !== null) {
            migration.removes.push(legacyVisibilityKey)
            changes = parseLegacyVisibility(readJson(legacyVisibilityKey), columns, defaultVisibility)

            if (changes) migration.writes.push([visibilityKey, JSON.stringify({ v: FORMAT_VERSION, visibility: changes })])
        }

        if (changes) visibility = { ...defaultVisibility, ...changes }
    }

    return { orderKey, visibilityKey, order, visibility, migration }
}

/**
 * Reads the saved layout of the table's current key, once per key, and migrates the old unscoped entries once (D-MIGRATE).
 * Reading is pure; the migration's writes and deletes happen in an effect, and are idempotent, so StrictMode's second run
 * changes nothing. Needs to run before the table is created, because the saved layout is part of its initial state.
 */
export const useSavedColumnLayout = (options: SavedColumnLayoutOptions): SavedColumnLayout => {
    const orderKey = options.enabled ? getColumnOrderStorageKey(options.uniqueKey) : undefined
    const visibilityKey = options.enabled ? getColumnVisibilityStorageKey(options.uniqueKey) : undefined

    const saved = useMemo(
        () => readSavedColumnLayout(options),
        // Read once per key and legacy key: a later change of the defaults or of the columns must not replace what the user
        // chose, and the columns of that render are the ones the saved layout is checked against.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [orderKey, visibilityKey, options.legacyOrderKey, options.legacyVisibilityKey],
    )

    useEffect(() => {
        for (const [key, value] of saved.migration.writes) tableStorage.set(key, value)
        for (const key of saved.migration.removes) tableStorage.remove(key)
    }, [saved])

    return saved
}

interface ColumnLayoutWriterOptions {
    saved: SavedColumnLayout
    defaultOrder: ColumnOrderState
    defaultVisibility: VisibilityState
    /** The app owns `state.columnVisibility`: a key change blocks writes but does not set the state itself. */
    controlledVisibility: boolean
}

/** Saves the table's order and visibility under the keys of `saved`, by the storage rule of `usePersistedStateWriter`. */
export const useColumnLayoutWriter = <TData>(table: Table<TData>, options: ColumnLayoutWriterOptions): void => {
    const { saved, defaultOrder, defaultVisibility, controlledVisibility } = options
    // Read live: the columns may change while the table stays mounted, so a list taken once would go stale (ASMA-8597, trap A).
    const definitionIds = getDefinitionColumnOrder(table)

    usePersistedStateWriter<ColumnOrderState>({
        storageKey: saved.orderKey,
        state: table.getState().columnOrder,
        defaultValue: defaultOrder,
        saved: saved.order,
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
        controlled: controlledVisibility,
        toSignature: (visibility) => columnVisibilitySignature(visibility, defaultVisibility),
        toStorage: (visibility) =>
            JSON.stringify({ v: FORMAT_VERSION, visibility: diffColumnVisibility(visibility, defaultVisibility) }),
        applyState: (visibility) => table.setColumnVisibility(visibility),
    })
}
