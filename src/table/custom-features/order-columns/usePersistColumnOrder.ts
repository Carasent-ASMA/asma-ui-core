import { useEffect } from 'react'
import type { Table } from '@tanstack/react-table'

export function usePersistColumnOrder<TData = unknown>(table: Table<TData>, key?: string | null) {
    const order = table.getState().columnOrder

    useEffect(() => {
        if (!key || !order) return

        try {
            localStorage.setItem(key, JSON.stringify(order))
        } catch (e) {
            console.error(e)
        }
    }, [order, key])
}
