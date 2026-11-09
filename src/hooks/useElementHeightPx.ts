import { useCallback, useLayoutEffect, useState } from 'react'

interface ElementHeightPx<T> {
    /** Callback ref: an element that mounts later (a dialog opening) is measured as it appears. */
    ref: (element: T | null) => void
    /** Height in CSS px, rounded; 0 while nothing is attached. */
    heightPx: number
}

/** Returns the height to report, or `null` to keep the previous one (e.g. while the element is hidden). */
export type MeasureHeight<T> = (element: T) => number | null

const borderBoxHeight = (element: HTMLElement): number => Math.round(element.getBoundingClientRect().height)

/**
 * Tracks an element's rendered height with a `ResizeObserver`, so it follows text wrapping, font
 * size, zoom and content changes as well as viewport resizes. The first measurement is taken
 * synchronously before paint; later ones are rAF-throttled. `measure` defaults to the border-box height;
 * pass a stable function (module-level or memoized).
 */
export function useElementHeightPx<T extends HTMLElement>(measure: MeasureHeight<T> = borderBoxHeight): ElementHeightPx<T> {
    const [element, setElement] = useState<T | null>(null)
    const [heightPx, setHeightPx] = useState(0)
    const ref = useCallback((node: T | null) => setElement(node), [])

    useLayoutEffect(() => {
        if (!element) return undefined

        let rafId = 0

        const commit = (): void => {
            const next = measure(element)
            if (next !== null) setHeightPx((prev) => (prev === next ? prev : next))
        }

        const schedule = (): void => {
            cancelAnimationFrame(rafId)
            rafId = requestAnimationFrame(commit)
        }

        commit()

        // jsdom (consumers' unit tests) has no ResizeObserver: keep the first measurement.
        if (typeof ResizeObserver === 'undefined') return () => cancelAnimationFrame(rafId)

        const ro = new ResizeObserver(schedule)
        ro.observe(element)

        return () => {
            cancelAnimationFrame(rafId)
            ro.disconnect()
        }
    }, [element, measure])

    return { ref, heightPx: element ? heightPx : 0 }
}
