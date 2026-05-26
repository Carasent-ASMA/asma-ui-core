import { useLayoutEffect, useRef } from 'react'

export function useProxyHorizontalScrollSync(enabled: boolean) {
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
