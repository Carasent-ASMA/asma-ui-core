import type { Table } from '@tanstack/react-table'
import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

/** The 0-based page index `?<param>=<page>` names: 0 when the parameter is missing, not a whole number, or below 2. */
export const readPageIndexFromUrl = (param: string): number => {
    const page = Number(new URLSearchParams(window.location.search).get(param))

    return Number.isInteger(page) && page > 1 ? page - 1 : 0
}

/**
 * Puts the page into the current entry's URL, and leaves the parameter out on the first page. Only this parameter changes
 * (the others keep their spelling), and the entry is replaced, never added, with its `history.state` (the router's key and
 * index, the overlay-back marker) kept: one Back must still leave the list (ASMA-8470).
 */
export const writePageIndexToUrl = (param: string, pageIndex: number): void => {
    const value = pageIndex > 0 ? String(pageIndex + 1) : null

    if (new URLSearchParams(window.location.search).get(param) === value) return

    const { pathname, search, hash } = window.location
    const others = search
        .slice(1)
        .split('&')
        .filter((pair) => pair !== '' && pair.split('=')[0] !== param)
    const query = [...others, ...(value === null ? [] : [`${param}=${value}`])].join('&')

    window.history.replaceState(window.history.state, '', `${pathname}${query ? `?${query}` : ''}${hash}`)
}

/** Calls `onPage` with the page of the entry a real Back or Forward lands on. */
const usePageOnTraversal = (param: string | undefined, onPage: (pageIndex: number) => void): void => {
    useEffect(() => {
        if (!param) return

        const onPopState = (event: PopStateEvent): void => {
            // single-spa replays every push and replace as a popstate; only a real Back or Forward restores the page.
            if ((event as PopStateEvent & { singleSpa?: boolean }).singleSpa) return

            onPage(readPageIndexFromUrl(param))
        }

        window.addEventListener('popstate', onPopState)

        return () => window.removeEventListener('popstate', onPopState)
    }, [param, onPage])
}

/**
 * `pageUrlParam` for a table whose app owns the pagination, server-side paging included (ASMA-8470): the page is written into
 * the URL with `replaceState` and taken back on Back and Forward. Read the page the table opens on with `readPageIndexFromUrl`
 * where its state is created, so the first request already asks for it. Resetting the page on a filter stays the app's job.
 */
export const useControlledPageUrlParam = (
    param: string,
    pageIndex: number,
    setPageIndex: (pageIndex: number) => void,
): void => {
    usePageOnTraversal(param, setPageIndex)

    useEffect(() => {
        writePageIndexToUrl(param, pageIndex)
    }, [param, pageIndex])
}

interface PendingPage {
    pageIndex: number
    /** Restored after a parent's layout effects, so a reset they make on the same URL change (a tab switch) runs first. */
    afterTraversal: boolean
}

/**
 * The page the URL names, waiting for the rows it needs. While one waits, the table must not reset its page when the data
 * arrives (`autoResetPageIndex: false`), or the rows that load after mount would send it back to the first page.
 */
export const usePendingPageFromUrl = (
    param: string | undefined,
): [PendingPage | null, (pending: PendingPage | null) => void] => {
    const [pending, setPending] = useState<PendingPage | null>(() => {
        const pageIndex = param ? readPageIndexFromUrl(param) : 0

        return pageIndex > 0 ? { pageIndex, afterTraversal: false } : null
    })

    usePageOnTraversal(
        param,
        useCallback((pageIndex: number) => setPending({ pageIndex, afterTraversal: true }), []),
    )

    return [pending, setPending]
}

/**
 * Keeps the page of a table that sets `pageUrlParam` in the URL (ASMA-8470): restored on mount, on reload and on Back or
 * Forward, written with `replaceState` on every page change, and dropped when the table goes back to the first page (a
 * filter, a search or a sort that changes the rows resets the page, as before).
 */
export const usePageUrlParam = <TData>({
    table,
    param,
    loading,
    pending,
    setPending,
}: {
    table: Table<TData>
    param: string | undefined
    loading: boolean
    pending: PendingPage | null
    setPending: (pending: PendingPage | null) => void
}): void => {
    const pageIndex = table.getState().pagination.pageIndex
    const rowCount = table.getPrePaginationRowModel().rows.length
    const canRestore = pending !== null && !loading && rowCount > 0

    const restore = (): void => {
        if (!pending) return

        // A page past the end (fewer rows than when it was saved) opens the last page.
        table.setPageIndex(Math.min(pending.pageIndex, Math.max(table.getPageCount() - 1, 0)))
        setPending(null)
    }

    // On mount before paint, so the first page never flashes.
    useLayoutEffect(() => {
        if (canRestore && !pending.afterTraversal) restore()
    })

    useEffect(() => {
        if (canRestore && pending.afterTraversal) restore()
    })

    useEffect(() => {
        if (param && pending === null) writePageIndexToUrl(param, pageIndex)
    }, [param, pageIndex, pending])
}
