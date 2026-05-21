import {
    useReactTable,
    type Row,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
} from '@tanstack/react-table'
import { useEffect, useRef } from 'react'
import { SELECT_COLUMN_ID, type StyledTableProps } from '../types'
import { ExpandedRowsFeature } from 'src/table/custom-features/expand-rows'
import { FocusedRowsFeature } from 'src/table/custom-features/focus-rows/FocusRowsFeature'
import { OrderColumnsFeature } from 'src/table/custom-features/order-columns/OrderColumnsFeature'
import { usePersistColumnOrder } from '../custom-features/order-columns/usePersistColumnOrder'
import { usePersistedColumnOrder } from 'src/table/custom-features/order-columns/usePersistedColumnOrder'

import { getPersistedPageSizeKey, usePersistedPageSize } from './usePersistedPageSize'
import { RowSelectionTooltipFeature } from 'src/table/custom-features/row-selection-tooltip/RowSelectionTooltipFeature'

export const useStyledTable = <
    TData extends {
        id: string | number
    },
    TCustomData = Record<string, unknown>,
>(
    props: StyledTableProps<TData, TCustomData>,
) => {
    const {
        columns,
        data,
        initialState,
        pageSize,
        enableRowSelection,
        tableInstanceRef,
        locale,
        persistColumnOrderKey,
        uniqueKey,
        ...rest
    } = props

    const columnOrder = usePersistedColumnOrder(persistColumnOrderKey)
    const persistedPageSize = usePersistedPageSize(uniqueKey)
    const resolvedPageSize = persistedPageSize ?? pageSize ?? 50

    const table = useReactTable({
        _features: [ExpandedRowsFeature, FocusedRowsFeature, OrderColumnsFeature, RowSelectionTooltipFeature],
        columns,
        data,
        meta: { locale: locale ?? 'en' },
        initialState: {
            pagination: { pageIndex: 0, pageSize: resolvedPageSize },
            columnVisibility: {
                ...initialState?.columnVisibility,
                [SELECT_COLUMN_ID]: false,
            },
            columnOrder,
            ...initialState,
        },
        enableRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getRowId:
            rest.getRowId ||
            ((row: TData, _index: number, parent?: Row<TData>) =>
                parent ? [parent.id, row.id].join('.') : row.id.toString()),
        defaultColumn: props.enableResizing
            ? {
                  size: undefined,
                  //   maxSize: Infinity,
              }
            : undefined,
        ...rest,
    })

    if (tableInstanceRef) {
        tableInstanceRef.current = table
    }

    usePersistColumnOrder(table, persistColumnOrderKey)

    const storageKey = getPersistedPageSizeKey(uniqueKey)
    const pageSizeState = table.getState().pagination?.pageSize
    const hydratedStorageKeyRef = useRef<string | undefined>(undefined)

    useEffect(() => {
        hydratedStorageKeyRef.current = undefined

        const currentPageSize = table.getState().pagination?.pageSize

        if (currentPageSize === resolvedPageSize) return

        table.setPageIndex(0)
        table.setPageSize(resolvedPageSize)
    }, [resolvedPageSize, storageKey, table])

    useEffect(() => {
        if (!storageKey || pageSizeState == null) return

        if (hydratedStorageKeyRef.current !== storageKey) {
            if (pageSizeState !== resolvedPageSize) return

            hydratedStorageKeyRef.current = storageKey
        }

        try {
            localStorage.setItem(storageKey, JSON.stringify(pageSizeState))
        } catch (e) {
            console.error(e)
        }
    }, [pageSizeState, resolvedPageSize, storageKey])

    return { table }
}
