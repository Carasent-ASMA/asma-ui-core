import {
    useReactTable,
    type ColumnOrderState,
    type ColumnSizingState,
    type Row,
    type SortingState,
    type Table,
    type VisibilityState,
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

import { DEFAULT_TABLE_PAGE_SIZE, getPersistedPageSizeKey, usePersistedPageSize } from './usePersistedPageSize'
import {
    columnSizingSignature,
    getColumnSizingStorageKey,
    serializeColumnSizing,
    usePersistedColumnSizing,
} from './useColumnSizingPersistence'
import {
    getSortingStorageKey,
    readSortingFromStorage,
    savesSorting,
    serializeSorting,
    sortingSignature,
} from './usePersistedSorting'
import { usePersistedStateWriter } from './usePersistedStateWriter'
import { useColumnLayoutReconcile, useColumnLayoutWriter, useSavedColumnLayout } from './useColumnLayoutPersistence'
import { normalizeDefaultColumnOrder } from '../custom-features/order-columns/columnLayout'
import { RowSelectionTooltipFeature } from 'src/table/custom-features/row-selection-tooltip/RowSelectionTooltipFeature'
import { getLeafColumnInfos } from '../helpers/columnIds'
import { resolveColumnSizingDefaults } from '../helpers/columnSizingDefaults'
import {
    createStyledDefaultSortingFn,
    resolveSortUndefinedDefaults,
    STYLED_DEFAULT_SORTING_FN,
} from '../helpers/defaultSortingFn'
import { tableStorage } from '../helpers/tableStorage'
import { usePageUrlParam, usePendingPageFromUrl } from './usePageUrlParam'

const NO_SORTING: SortingState = []
const NO_COLUMN_SIZING: ColumnSizingState = {}
const NO_COLUMN_ORDER: ColumnOrderState = []
/** What a table opens with when the app declares no visibility: the select column is hidden until the app shows it. */
const DEFAULT_COLUMN_VISIBILITY: VisibilityState = { [SELECT_COLUMN_ID]: false }

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
        // Ours, not TanStack's: they must never reach `useReactTable` through `...rest`.
        persistSorting,
        persistColumnLayout,
        legacyColumnVisibilityKey,
        defaultColumn,
        pageUrlParam,
        ...rest
    } = props

    // What Reset columns and the storage rule treat as "the default" comes from the props of this render,
    // never from `table.initialState`, which holds the saved state (ASMA-8597, trap A).
    const defaultSorting = initialState?.sorting ?? NO_SORTING
    const defaultColumnSizing = initialState?.columnSizing ?? NO_COLUMN_SIZING

    // Resizing is on in every table unless it passes `enableColumnResizing={false}` (D15). Widths are saved only when the
    // app wrote the prop as `true` (D17), so a table that gets resizing from the default resizes in memory only.
    const canResize = props.enableColumnResizing ?? true
    const savesWidths = props.enableColumnResizing === true
    // The default widths (D16, DEC-NARROW) are resolved on the definitions, before TanStack sees them. So is
    // `sortUndefined: false` (P2f), which only the columns that sort with the default comparison get.
    const sizedColumns = useMemo(
        () =>
            resolveSortUndefinedDefaults(
                resolveColumnSizingDefaults(columns, { defaultColumn, enableSorting: rest.enableSorting, canResize }),
                defaultColumn,
            ),
        [columns, defaultColumn, rest.enableSorting, canResize],
    )
    const leafColumns = getLeafColumnInfos(columns, {
        defaultColumn,
        enableSorting: rest.enableSorting,
        enableMultiSort: rest.enableMultiSort,
        enableHiding: rest.enableHiding,
    })

    // Per-user column order and visibility, behind an explicit opt-in (ASMA-8695). A table that does not opt in keeps the
    // unscoped `persistColumnOrderKey` and the visibility its app owns, exactly as before (REQ-08).
    const layoutOptedIn = persistColumnLayout === true
    const definitionIds = leafColumns.map((column) => column.id)
    // The app's order with the columns it does not name at their definition position (DEC-03), as in a saved order.
    const defaultColumnOrder = normalizeDefaultColumnOrder(initialState?.columnOrder ?? NO_COLUMN_ORDER, definitionIds)
    const defaultColumnVisibility = initialState?.columnVisibility ?? DEFAULT_COLUMN_VISIBILITY
    const savedLayout = useSavedColumnLayout({
        enabled: layoutOptedIn,
        uniqueKey,
        legacyOrderKey: persistColumnOrderKey,
        legacyVisibilityKey: legacyColumnVisibilityKey,
        columns: leafColumns,
        defaultOrder: defaultColumnOrder,
        defaultVisibility: defaultColumnVisibility,
    })

    const columnOrder = usePersistedColumnOrder(layoutOptedIn ? undefined : persistColumnOrderKey)
    const columnSizingKey = savesWidths ? uniqueKey : undefined
    const columnSizingStorageKey = getColumnSizingStorageKey(columnSizingKey)
    const persistedColumnSizing = usePersistedColumnSizing(columnSizingKey, defaultColumnSizing)
    // Sorting is saved whenever the table has a key to save it under (ASMA-8698), unless it opts out with `persistSorting={false}`
    // or the app owns the state: `state.sorting`, or an `onSortingChange` that TanStack calls instead of updating it (`savesSorting`).
    const controlledSorting = rest.state?.sorting !== undefined || rest.onSortingChange !== undefined
    const sortingStorageKey = savesSorting({ uniqueKey, persistSorting, controlled: controlledSorting })
        ? getSortingStorageKey(uniqueKey)
        : undefined
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
    const resolvedPageSize = persistedPageSize ?? pageSize ?? DEFAULT_TABLE_PAGE_SIZE

    // The default comparison (ASMA-8597, P2f). It reads the direction of the column it compares from the table that sorts,
    // through this ref, which is filled right after `useReactTable` below: not the app's optional `tableInstanceRef`, and
    // not the sorting array of the render that registered the function, which is out of date by the next click.
    //
    // Why writing it during render is safe (DeepSeek's audit of #340): a `useRef` value lives on the component instance, not
    // on one render, so a write from a render that React later discards is not undone. It does no harm, because
    // `useReactTable` creates its table in a `useState` initialiser: the table of this instance never changes, and every
    // write, a discarded render's included, puts that same table into the ref. TanStack itself updates that table's options
    // during render. The comparison below reads only this instance's table, and the direction live from `table.getState()`
    // each time it runs. Pinned by the two-tables test in `StyledTable.defaultSort.interaction.test.tsx`.
    const sortingTableRef = useRef<Table<TData> | undefined>(undefined)
    const styledDefaultSortingFn = useMemo(() => createStyledDefaultSortingFn<TData>(() => sortingTableRef.current), [])
    // The default comparison, unless the app's own `defaultColumn` names one. It carries no `sortUndefined`: TanStack merges
    // `defaultColumn` under every column, so that would reach columns with their own `sortingFn` too. The columns that sort
    // with the default get `sortUndefined: false` on their definitions instead (`resolveSortUndefinedDefaults`). Memoised so
    // that TanStack's default column definition, which is derived from this, is not rebuilt on every render.
    const tableDefaultColumn = useMemo(
        () => ({ ...defaultColumn, sortingFn: defaultColumn?.sortingFn ?? STYLED_DEFAULT_SORTING_FN }),
        [defaultColumn],
    )

    // A table whose app owns the pagination state keeps the page where the app keeps it.
    const pageParam = rest.state?.pagination === undefined && !rest.onPaginationChange ? pageUrlParam : undefined
    const [pendingPage, setPendingPage] = usePendingPageFromUrl(pageParam)

    const table = useReactTable({
        _features: [ExpandedRowsFeature, FocusedRowsFeature, OrderColumnsFeature, RowSelectionTooltipFeature],
        columns: sizedColumns,
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
            // A table that opted in with `persistColumnLayout` also lets a saved order and saved visibility beat the app's
            // (ASMA-8695, REQ-02); any other table keeps its order of precedence (REQ-08).
            ...(layoutOptedIn && defaultColumnOrder.length > 0 && { columnOrder: defaultColumnOrder }),
            ...(savedLayout.order && { columnOrder: savedLayout.order }),
            ...(savedLayout.visibility && { columnVisibility: savedLayout.visibility }),
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
        defaultColumn: tableDefaultColumn,
        ...rest,
        // After `...rest`, so the resolved default is what TanStack gets whether or not the app passed the prop (D15).
        enableColumnResizing: canResize,
        // The same, for the sorting functions: ours is kept beside the app's own, which stay available to its columns.
        sortingFns: { [STYLED_DEFAULT_SORTING_FN]: styledDefaultSortingFn, ...rest.sortingFns },
        // The rows that load after mount must not reset the page the URL names before it is restored. Always passed:
        // TanStack merges each render's options into the last ones, so a `false` left out would stay.
        autoResetPageIndex: pendingPage ? false : rest.autoResetPageIndex,
    })

    sortingTableRef.current = table

    usePageUrlParam({
        table,
        param: pageParam,
        loading: !!rest.loading,
        pending: pendingPage,
        setPending: setPendingPage,
    })

    // TanStack re-sorts only when the sorting or the rows change, and the text order depends on the locale too. So when the
    // locale of a table that stays mounted changes, the current sorting is set again as a new array, which has the same
    // content and a new identity, and the rows sort again in the new language. The first mount has nothing to redo, and an
    // unsorted table has nothing to sort.
    const sortLocale = table.options.meta?.locale
    const previousSortLocaleRef = useRef(sortLocale)

    useEffect(() => {
        if (previousSortLocaleRef.current === sortLocale) return

        previousSortLocaleRef.current = sortLocale

        if (table.getState().sorting.length > 0) table.setSorting((previous) => [...previous])
    }, [sortLocale, table])

    if (tableInstanceRef) {
        tableInstanceRef.current = table
    }

    usePersistColumnOrder(table, layoutOptedIn ? undefined : persistColumnOrderKey, {
        saved: columnOrder,
        defaultOrder: initialState?.columnOrder,
        controlled: rest.state?.columnOrder !== undefined,
    })

    // Brings the state in step with new columns and changed defaults before anything is saved (ASMA-8695).
    const reconcilingLayout = useColumnLayoutReconcile(table, {
        enabled: layoutOptedIn,
        definitionIds,
        defaultOrder: defaultColumnOrder,
        defaultVisibility: defaultColumnVisibility,
        controlledVisibility: rest.state?.columnVisibility !== undefined,
    })

    useColumnLayoutWriter(table, {
        saved: savedLayout,
        reconciling: reconcilingLayout,
        defaultOrder: defaultColumnOrder,
        defaultVisibility: defaultColumnVisibility,
        controlledVisibility: rest.state?.columnVisibility !== undefined,
    })

    const controlsVisibility = rest.state?.columnVisibility !== undefined || rest.onColumnVisibilityChange !== undefined

    useEffect(() => {
        if (import.meta.env.DEV && layoutOptedIn && controlsVisibility) {
            console.warn(
                'StyledTable: `persistColumnLayout` saves and restores the visibility itself, so do not pass `state.columnVisibility` or `onColumnVisibilityChange`; declare the defaults in `initialState.columnVisibility`.',
            )
        }
    }, [layoutOptedIn, controlsVisibility])

    usePersistedStateWriter<SortingState>({
        storageKey: sortingStorageKey,
        state: table.getState().sorting,
        defaultValue: defaultSorting,
        saved: persistedSorting,
        // A table that owns `state.sorting` loads the new key's sort through `usePersistedSorting`.
        controlled: controlledSorting,
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

    // What the column settings dot compares with: known only where the table saves the layout itself (ASMA-8695, DEC-05).
    table.columnLayoutDefaults = layoutOptedIn
        ? { order: defaultColumnOrder, visibility: defaultColumnVisibility }
        : undefined

    // Reset columns (ASMA-8597, REQ-008): order and widths go back to the defaults of this render, and
    // sorting does too on a table that saves it (ASMA-8698). On a table with `persistColumnLayout` the visibility
    // goes back too (ASMA-8695, OQ-02); any other table's visibility, pinning, page size, selection and
    // expansion are left alone. Assigned on every render so it always sees the current defaults.
    table.resetColumnSettings = () => {
        table.setColumnOrder(layoutOptedIn ? defaultColumnOrder : [])
        table.setColumnSizing(defaultColumnSizing)

        if (layoutOptedIn) {
            table.setColumnVisibility(defaultColumnVisibility)
        }

        if (sortingStorageKey) {
            table.setSorting(defaultSorting)
        }

        // An opted-in table without a per-user key does not own the old keys: it neither migrates nor deletes them.
        const hasLayoutKeys = layoutOptedIn && savedLayout.orderKey !== undefined
        const layoutStorageKeys = hasLayoutKeys
            ? [savedLayout.orderKey, savedLayout.visibilityKey, persistColumnOrderKey, legacyColumnVisibilityKey]
            : []
        const unscopedOrderKey = layoutOptedIn ? undefined : persistColumnOrderKey

        for (const storageKey of [sortingStorageKey, columnSizingStorageKey, unscopedOrderKey, ...layoutStorageKeys]) {
            if (storageKey) tableStorage.remove(storageKey)
        }
    }

    const storageKey = getPersistedPageSizeKey(uniqueKey)
    const pageSizeState = table.getState().pagination?.pageSize
    const hydratedStorageKeyRef = useRef<string | undefined>(undefined)
    /** The page size the table had when it was last loaded from, or saved to, the current key. */
    const lastPageSizeRef = useRef<number | undefined>(undefined)

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

            // Loaded: the saved size, or the table's own when none is saved. Mounting and loading a key write nothing; only a
            // change after that does (ASMA-8698). A table opened before its old entries were migrated would otherwise save the
            // default under the new key, and the migration, which never overwrites, would keep that and drop the user's size.
            hydratedStorageKeyRef.current = storageKey
            lastPageSizeRef.current = pageSizeState

            return
        }

        if (pageSizeState === lastPageSizeRef.current) return

        lastPageSizeRef.current = pageSizeState
        tableStorage.set(storageKey, JSON.stringify(pageSizeState))
    }, [pageSizeState, resolvedPageSize, storageKey])

    return { table }
}
