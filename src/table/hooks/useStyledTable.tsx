import {
    useReactTable,
    type ColumnSizingState,
    type Row,
    type SortingState,
    type Table,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
} from '@tanstack/react-table'
import { useEffect, useMemo, useRef } from 'react'
import { SELECT_COLUMN_ID, type StyledTableProps } from '../types'
import { ExpandedRowsFeature } from 'src/table/custom-features/expand-rows'
import { FocusedRowsFeature } from 'src/table/custom-features/focus-rows/FocusRowsFeature'
import { OrderColumnsFeature } from 'src/table/custom-features/order-columns/OrderColumnsFeature'
import { usePersistColumnOrder } from '../custom-features/order-columns/usePersistColumnOrder'
import { usePersistedColumnOrder } from 'src/table/custom-features/order-columns/usePersistedColumnOrder'

import { getPersistedPageSizeKey, usePersistedPageSize } from './usePersistedPageSize'
import {
    columnSizingSignature,
    getColumnSizingStorageKey,
    serializeColumnSizing,
    usePersistedColumnSizing,
} from './useColumnSizingPersistence'
import {
    getSortingStorageKey,
    readSortingFromStorage,
    serializeSorting,
    sortingSignature,
} from './usePersistedSorting'
import { usePersistedStateWriter } from './usePersistedStateWriter'
import { RowSelectionTooltipFeature } from 'src/table/custom-features/row-selection-tooltip/RowSelectionTooltipFeature'
import { getLeafColumnInfos } from '../helpers/columnIds'
import { tableStorage } from '../helpers/tableStorage'

const DEFAULT_RESIZABLE_COLUMN_MIN_SIZE = 100
const NO_SORTING: SortingState = []
const NO_COLUMN_SIZING: ColumnSizingState = {}

export const useStyledTable = <
    TData extends {
        id: string | number
    },
    TCustomData = Record<string, unknown>,
>(
    props: StyledTableProps<TData, TCustomData>,
): { table: Table<TData> } => {
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
        // Ours, not TanStack's: it must never reach `useReactTable` through `...rest`.
        persistSorting,
        defaultColumn,
        ...rest
    } = props

    // What Reset columns and the storage rule treat as "the default" comes from the props of this render,
    // never from `table.initialState`, which holds the saved state (ASMA-8597, trap A).
    const defaultSorting = initialState?.sorting ?? NO_SORTING
    const defaultColumnSizing = initialState?.columnSizing ?? NO_COLUMN_SIZING

    const resolvedDefaultColumn = props.enableColumnResizing
        ? {
              minSize: DEFAULT_RESIZABLE_COLUMN_MIN_SIZE,
              ...defaultColumn,
          }
        : defaultColumn
    const leafColumns = getLeafColumnInfos(columns, {
        defaultColumn: resolvedDefaultColumn,
        enableSorting: rest.enableSorting,
        enableMultiSort: rest.enableMultiSort,
    })

    const columnOrder = usePersistedColumnOrder(persistColumnOrderKey)
    const columnSizingKey = props.enableColumnResizing ? uniqueKey : undefined
    const columnSizingStorageKey = getColumnSizingStorageKey(columnSizingKey)
    const persistedColumnSizing = usePersistedColumnSizing(
        columnSizingKey,
        leafColumns.map((column) => column.id),
        defaultColumnSizing,
    )
    // Sorting is saved only when the table opts in (D1) and has a key to save it under.
    const sortingStorageKey = persistSorting ? getSortingStorageKey(uniqueKey) : undefined
    const persistedSorting = useMemo(
        () =>
            sortingStorageKey
                ? readSortingFromStorage(uniqueKey, {
                      sortableColumns: leafColumns.filter((column) => column.canSort),
                      maxMultiSortColCount: rest.maxMultiSortColCount,
                  })
                : undefined,
        // Read once per key; the columns of that render are the ones the saved sort is checked against.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [sortingStorageKey],
    )
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
            ...(columnOrder && { columnOrder }),
            ...initialState,
            // Saved values beat the app's own, widths and sorting alike (ASMA-8597, trap B). Sorting is
            // tested with `!== undefined` so a saved `[]` (sorting turned off) beats a non-empty default.
            ...(persistedColumnSizing && { columnSizing: persistedColumnSizing }),
            ...(persistedSorting !== undefined && { sorting: persistedSorting }),
        },
        enableRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getRowId:
            rest.getRowId ??
            ((row: TData, _index: number, parent?: Row<TData>) =>
                parent ? [parent.id, row.id].join('.') : row.id.toString()),
        defaultColumn: resolvedDefaultColumn,
        ...rest,
    })

    if (tableInstanceRef) {
        tableInstanceRef.current = table
    }

    usePersistColumnOrder(table, persistColumnOrderKey)

    usePersistedStateWriter<SortingState>({
        storageKey: sortingStorageKey,
        state: table.getState().sorting,
        defaultValue: defaultSorting,
        saved: persistedSorting,
        // A table that owns `state.sorting` loads the new key's sort through `usePersistedSorting`.
        controlled: rest.state?.sorting !== undefined,
        toSignature: sortingSignature,
        toStorage: serializeSorting,
        applyState: (sorting) => table.setSorting(sorting),
    })

    usePersistedStateWriter<ColumnSizingState>({
        storageKey: columnSizingStorageKey,
        state: table.getState().columnSizing,
        defaultValue: defaultColumnSizing,
        saved: persistedColumnSizing,
        // Widths are saved when a drag ends, never during it.
        settled: !table.getState().columnSizingInfo.isResizingColumn,
        toSignature: columnSizingSignature,
        toStorage: serializeColumnSizing,
        applyState: (columnSizing) => table.setColumnSizing(columnSizing),
    })

    // Reset columns (ASMA-8597, REQ-008): order and widths go back to the defaults of this render, and
    // sorting does too only on a table that opted in (D1). Visibility, pinning, page size, selection and
    // expansion are left alone. Assigned on every render so it always sees the current defaults.
    table.resetColumnSettings = () => {
        table.setColumnOrder([])
        table.setColumnSizing(defaultColumnSizing)

        if (sortingStorageKey) {
            table.setSorting(defaultSorting)
        }

        for (const storageKey of [sortingStorageKey, columnSizingStorageKey, persistColumnOrderKey]) {
            if (storageKey) tableStorage.remove(storageKey)
        }
    }

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

        tableStorage.set(storageKey, JSON.stringify(pageSizeState))
    }, [pageSizeState, resolvedPageSize, storageKey])

    return { table }
}
