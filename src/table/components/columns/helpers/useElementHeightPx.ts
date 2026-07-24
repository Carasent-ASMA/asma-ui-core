import { useLayoutEffect, useRef, useState, type RefObject } from 'react'

interface ElementHeightPx<T> {
    // RefObject<T> already types `current` as `T | null` internally — `useRef<T>(null)` below
    // returns exactly `RefObject<T>` (its `T | null` overload). Annotating this as `RefObject<T |
    // null>` would be a WIDER, non-identical instantiation: TypeScript relates two `RefObject<...>`
    // instantiations by comparing their type arguments directly (not the expanded `current` type),
    // so `RefObject<T | null>` fails to satisfy a plain `<div ref={...}>` (which wants
    // `RefObject<T>`) even though the expanded shapes are the same.
    ref: RefObject<T>
    heightPx: number
}

export function useElementHeightPx<T extends HTMLElement>(): ElementHeightPx<T> {
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
