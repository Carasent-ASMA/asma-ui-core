import { useLayoutEffect, useRef, useState } from 'react'

export function useElementHeightPx<T extends HTMLElement>() {
    const ref = useRef<T>(null)
    const [heightPx, setHeightPx] = useState(0)

    useLayoutEffect(() => {
        const el = ref.current
        if (!el) return

        let rafId = 0

        const commit = () => {
            const next = Math.round(el.getBoundingClientRect().height)
            setHeightPx((prev) => (prev === next ? prev : next))
        }

        const measure = () => {
            cancelAnimationFrame(rafId)
            rafId = requestAnimationFrame(commit)
        }

        measure()

        const ro = new ResizeObserver(measure)
        ro.observe(el)

        return () => {
            cancelAnimationFrame(rafId)
            ro.disconnect()
        }
    }, [])

    return { ref, heightPx }
}
