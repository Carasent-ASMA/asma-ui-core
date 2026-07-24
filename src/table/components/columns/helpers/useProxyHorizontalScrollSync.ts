import { useLayoutEffect, useRef, type RefObject } from 'react'

interface ProxyHorizontalScrollSync {
    // RefObject<T> already types `current` as `T | null` — an explicit `T | null` here would make
    // this a DIFFERENT (wider) instantiation that a plain `<div ref={...}>` no longer accepts (see
    // the JSX `ref` assignability note on useElementHeightPx.ts).
    tableScrollRef: RefObject<HTMLDivElement>
    tableXRef: RefObject<HTMLDivElement>
    hScrollRef: RefObject<HTMLDivElement>
    hScrollContentRef: RefObject<HTMLDivElement>
}

export function useProxyHorizontalScrollSync(enabled: boolean): ProxyHorizontalScrollSync {
    const tableScrollRef = useRef<HTMLDivElement | null>(null)
    const tableXRef = useRef<HTMLDivElement | null>(null)
    const hScrollRef = useRef<HTMLDivElement | null>(null)
    const hScrollContentRef = useRef<HTMLDivElement | null>(null)

    useLayoutEffect(() => {
        if (!enabled) return

        const tableScrollEl = tableScrollRef.current
        const tableXEl = tableXRef.current
        const hScrollEl = hScrollRef.current
        const hScrollContentEl = hScrollContentRef.current
        if (!tableScrollEl || !tableXEl || !hScrollEl || !hScrollContentEl) return

        let syncing = false

        const syncWidth = () => {
            hScrollContentEl.style.width = `${tableXEl.scrollWidth}px`
        }

        const syncProxyFromTable = () => {
            if (syncing) return
            syncing = true
            hScrollEl.scrollLeft = tableXEl.scrollLeft
            syncing = false
        }

        const syncTableFromProxy = () => {
            if (syncing) return
            syncing = true
            tableXEl.scrollLeft = hScrollEl.scrollLeft
            syncing = false
        }

        syncWidth()
        syncProxyFromTable()

        tableXEl.addEventListener('scroll', syncProxyFromTable, { passive: true })
        hScrollEl.addEventListener('scroll', syncTableFromProxy, { passive: true })

        const content = tableXEl.querySelector('table')
        const ro = new ResizeObserver(syncWidth)
        ro.observe(tableXEl)

        if (content) {
            ro.observe(content)
        }

        return () => {
            tableXEl.removeEventListener('scroll', syncProxyFromTable)
            hScrollEl.removeEventListener('scroll', syncTableFromProxy)
            ro.disconnect()
        }
    }, [enabled])

    return { tableScrollRef, tableXRef, hScrollRef, hScrollContentRef }
}
