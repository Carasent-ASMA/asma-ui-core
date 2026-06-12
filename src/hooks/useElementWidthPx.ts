import { useLayoutEffect, useRef, useState, type RefObject } from 'react'

/**
 * Tracks an element's width. The first measurement happens synchronously in a
 * layout effect (before paint) so width-driven layouts never flash an
 * unmeasured state; subsequent resize events are rAF-throttled.
 */
export function useElementWidthPx<T extends HTMLElement>(): { ref: RefObject<T>; widthPx: number } {
    const ref = useRef<T>(null)
    const [widthPx, setWidthPx] = useState(0)

    useLayoutEffect(() => {
        const element = ref.current
        if (!element) {
            return undefined
        }

        let rafId = 0

        const commit = () => {
            const next = Math.round(element.getBoundingClientRect().width)
            setWidthPx((previous) => (previous === next ? previous : next))
        }

        const scheduleCommit = () => {
            cancelAnimationFrame(rafId)
            rafId = requestAnimationFrame(commit)
        }

        commit()

        const resizeObserver = new ResizeObserver(scheduleCommit)
        resizeObserver.observe(element)

        return () => {
            cancelAnimationFrame(rafId)
            resizeObserver.disconnect()
        }
    }, [])

    return { ref, widthPx }
}
