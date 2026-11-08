import { useEffect, useRef } from 'react'
import type { Table } from '@tanstack/react-table'
import { tableStorage } from 'src/table/helpers/tableStorage'
import { isDefaultColumnOrder } from './columnLayout'

/**
 * Saves the column order under `key` when it changes. An order that is `[]` or that matches the live
 * definition order removes the entry instead (ASMA-8597, REQ-004), so a table the user has put back to its
 * defaults stores nothing. Mounting never writes.
 */
export function usePersistColumnOrder<TData = unknown>(table: Table<TData>, key?: string | null): void {
    const order = table.getState().columnOrder
    const signature = JSON.stringify(order ?? [])
    const isDefault = !order?.length || isDefaultColumnOrder(table)

    const keyRef = useRef(key)
    const lastSeenRef = useRef(signature)

    useEffect(() => {
        // A different key is a different table's entry: take its state as the starting point, write nothing.
        if (keyRef.current !== key) {
            keyRef.current = key
            lastSeenRef.current = signature
            return
        }

        if (!key || signature === lastSeenRef.current) return

        lastSeenRef.current = signature

        if (isDefault) {
            tableStorage.remove(key)
        } else {
            tableStorage.set(key, signature)
        }
        // `order` is covered by `signature`, and `isDefault` is computed from the same render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signature, key])
}
