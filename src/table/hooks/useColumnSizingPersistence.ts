import { useEffect, useMemo } from 'react'
import type { ColumnSizingState, Table } from '@tanstack/react-table'

const COLUMN_SIZING_KEY_SUFFIX = ':column-sizing'

const parseColumnSizing = (raw: string | null): ColumnSizingState | undefined => {
    if (!raw) return undefined

    try {
        const parsed: unknown = JSON.parse(raw)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return undefined

        return Object.fromEntries(
            Object.entries(parsed).filter(
                (entry): entry is [string, number] =>
                    typeof entry[1] === 'number' && Number.isFinite(entry[1]) && entry[1] > 0,
            ),
        )
    } catch {
        return undefined
    }
}

const getColumnSizingKey = (uniqueKey?: string): string | undefined =>
    uniqueKey ? `${uniqueKey}${COLUMN_SIZING_KEY_SUFFIX}` : undefined

export const usePersistedColumnSizing = (uniqueKey?: string): ColumnSizingState | undefined =>
    useMemo(() => {
        const storageKey = getColumnSizingKey(uniqueKey)
        if (!storageKey || !uniqueKey) return undefined

        try {
            return parseColumnSizing(localStorage.getItem(storageKey)) ?? parseColumnSizing(localStorage.getItem(uniqueKey))
        } catch {
            return undefined
        }
    }, [uniqueKey])

export const usePersistColumnSizing = <TData>(table: Table<TData>, uniqueKey?: string): void => {
    const storageKey = getColumnSizingKey(uniqueKey)
    const columnSizing = table.getState().columnSizing
    const isResizing = Boolean(table.getState().columnSizingInfo.isResizingColumn)

    useEffect(() => {
        if (!storageKey || isResizing) return

        try {
            localStorage.setItem(storageKey, JSON.stringify(columnSizing))
        } catch {
            return
        }
    }, [columnSizing, isResizing, storageKey])
}
