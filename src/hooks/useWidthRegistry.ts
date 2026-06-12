import { useCallback, useEffect, useRef, useState } from 'react'

export type WidthMeasureMode = 'box' | 'scroll'

export interface WidthRegistry {
    /**
     * Returns a stable callback ref for `key`. Attach it to the element whose
     * width should be tracked. `scroll` mode measures `scrollWidth` (natural
     * content width, ignoring truncation); `box` measures the border box.
     */
    register: (key: string, mode?: WidthMeasureMode) => (element: HTMLElement | null) => void
    /**
     * Last known width per key. Keys keep their last value after the element
     * unmounts, so variant widths (e.g. label vs icon-only) stay available
     * once each variant has been rendered at least once.
     */
    widths: Readonly<Record<string, number>>
}

interface RegistryEntry {
    element: HTMLElement
    mode: WidthMeasureMode
}

/**
 * Tracks real, rendered widths of a dynamic set of keyed elements with a
 * single shared ResizeObserver. Used by DynamicToolbar to drive layout
 * planning from measured widths instead of hard-coded estimates.
 */
export function useWidthRegistry(): WidthRegistry {
    const [widths, setWidths] = useState<Record<string, number>>({})
    const entriesRef = useRef(new Map<string, RegistryEntry>())
    const keysByElementRef = useRef(new Map<HTMLElement, string>())
    const refCallbacksRef = useRef(new Map<string, (element: HTMLElement | null) => void>())
    const observerRef = useRef<ResizeObserver | null>(null)

    const measureKey = useCallback((key: string) => {
        const entry = entriesRef.current.get(key)
        if (!entry) {
            return
        }

        const raw =
            entry.mode === 'scroll' ? entry.element.scrollWidth : entry.element.getBoundingClientRect().width
        const next = Math.ceil(raw)

        setWidths((previous) => (previous[key] === next ? previous : { ...previous, [key]: next }))
    }, [])

    const getObserver = useCallback(() => {
        observerRef.current ??= new ResizeObserver((observed) => {
            for (const { target } of observed) {
                const key = keysByElementRef.current.get(target as HTMLElement)
                if (key) {
                    measureKey(key)
                }
            }
        })

        return observerRef.current
    }, [measureKey])

    const register = useCallback(
        (key: string, mode: WidthMeasureMode = 'box') => {
            const cacheKey = `${key}|${mode}`
            const cached = refCallbacksRef.current.get(cacheKey)
            if (cached) {
                return cached
            }

            const callback = (element: HTMLElement | null) => {
                const previous = entriesRef.current.get(key)
                if (previous) {
                    getObserver().unobserve(previous.element)
                    keysByElementRef.current.delete(previous.element)
                    entriesRef.current.delete(key)
                }

                if (element) {
                    entriesRef.current.set(key, { element, mode })
                    keysByElementRef.current.set(element, key)
                    getObserver().observe(element)
                    /* Measure immediately so the first planned layout already
                     * uses the real width; the observer keeps it up to date. */
                    measureKey(key)
                }
                /* On unmount the last width is intentionally kept as a cache. */
            }

            refCallbacksRef.current.set(cacheKey, callback)

            return callback
        },
        [getObserver, measureKey],
    )

    useEffect(
        () => () => {
            observerRef.current?.disconnect()
            observerRef.current = null
        },
        [],
    )

    return { register, widths }
}
