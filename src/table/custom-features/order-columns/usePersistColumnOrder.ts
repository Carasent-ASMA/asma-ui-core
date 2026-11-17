import { useEffect, useLayoutEffect, useRef } from 'react'
import type { ColumnOrderState, Table } from '@tanstack/react-table'
import { tableStorage } from 'src/table/helpers/tableStorage'
import { isDefaultColumnOrder } from './columnLayout'

interface PersistColumnOrderLoad {
    /** The order this render's key has saved, as `usePersistedColumnOrder` read it; `undefined` when nothing valid is saved. */
    saved?: ColumnOrderState
    /** The table's own order (`initialState.columnOrder`), which a table opens with ahead of a saved one. */
    defaultOrder?: ColumnOrderState
    /** The app owns `state.columnOrder`: a key change blocks writes but does not set the order itself. */
    controlled?: boolean
}

const NO_ORDER: ColumnOrderState = []

/**
 * Saves the column order under `key` when it changes. An order that is `[]` or that matches the live
 * definition order removes the entry instead (ASMA-8597, REQ-004), so a table the user has put back to its
 * defaults stores nothing. Mounting never writes. A table with no key does no work per render (ASMA-8698), and whether the
 * order is the default is worked out only when it is about to be saved.
 *
 * When `key` changes on a table that stays mounted (one table, a key per tab), the new key's order is loaded into the
 * table in a layout effect, so the old order is never painted under the new key (ASMA-8698). It is the order a fresh
 * mount with that key would open with: the table's own `defaultOrder` when it has one, else the saved one, else `[]`.
 * Nothing is written or removed under the new key until the order is the loaded one, and the old key's entry is never
 * touched. When the key goes away the table goes back to its default and writes nothing.
 */
export function usePersistColumnOrder<TData = unknown>(
    table: Table<TData>,
    key?: string | null,
    load: PersistColumnOrderLoad = {},
): void {
    const { saved, defaultOrder, controlled = false } = load
    const order = table.getState().columnOrder
    const signature = key ? JSON.stringify(order ?? []) : ''

    const keyRef = useRef(key)
    const lastSeenRef = useRef(signature)
    const blockRef = useRef<{ stale: string; loaded: string } | null>(null)

    // Runs only when the key changes, in the render that already holds the new key's `saved` order.
    useLayoutEffect(() => {
        if (keyRef.current === key) return

        keyRef.current = key
        blockRef.current = null
        lastSeenRef.current = signature

        const target = (key ? (defaultOrder ?? saved) : defaultOrder) ?? NO_ORDER
        const loaded = JSON.stringify(target)

        if (key) blockRef.current = { stale: signature, loaded }

        // `signature` is empty while there is no key, so the current order is worked out here, once per key change.
        if (!controlled && loaded !== JSON.stringify(order ?? [])) table.setColumnOrder(target)
        // Only a key change reloads; the closure is that render's, so it holds the new key's values.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key])

    useEffect(() => {
        if (!key) return

        const block = blockRef.current

        if (block) {
            if (signature === block.loaded) {
                blockRef.current = null
                lastSeenRef.current = signature
                return
            }

            // Still the old key's order: the load has not reached the state yet.
            if (signature === block.stale) return

            // Neither: the user changed it, which is a real change under the new key.
            blockRef.current = null
        }

        if (signature === lastSeenRef.current) return

        lastSeenRef.current = signature

        if (!order?.length || isDefaultColumnOrder(table)) {
            tableStorage.remove(key)
        } else {
            tableStorage.set(key, signature)
        }
        // `order` is covered by `signature`.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signature, key])
}
