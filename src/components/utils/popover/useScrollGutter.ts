import { type RefObject, useLayoutEffect, useState } from 'react'

export interface ScrollGutter {
    /** Layout width the scrollbar takes: 15-17px for a classic bar, 0 for an overlay one. */
    width: number
    /** The content is taller than the scroll container. */
    overflows: boolean
}

const NONE: ScrollGutter = { width: 0, overflows: false }

/**
 * Measures a scroll container's scrollbar gutter and whether it overflows, and keeps both current.
 *
 * Meant for a container with `scrollbar-gutter: stable`: its gutter is then reserved whether or not it
 * scrolls, so `width` is a property of the platform (and zoom), not of the content — padding derived
 * from it cannot oscillate as scrolling starts and stops. Re-measured on its own resize, on any direct
 * child's resize (content growing inside a container already at max-height does not resize it), when
 * children are added or removed, and on window resize, which also catches browser zoom.
 *
 * Measured in a layout effect, so the corrected layout is in place before the first paint.
 */
export const useScrollGutter = (ref: RefObject<HTMLElement | null>): ScrollGutter => {
    const [gutter, setGutter] = useState<ScrollGutter>(NONE)

    useLayoutEffect(() => {
        const element = ref.current
        if (!element) return undefined

        const measure = (): void => {
            const width = element.offsetWidth - element.clientWidth
            const overflows = element.scrollHeight > element.clientHeight
            setGutter((previous) =>
                previous.width === width && previous.overflows === overflows ? previous : { width, overflows },
            )
        }
        measure()

        // Environments without the observers (jsdom) keep the first measurement.
        if (typeof ResizeObserver === 'undefined' || typeof MutationObserver === 'undefined') return undefined

        const resize = new ResizeObserver(measure)
        const observeChildren = (): void => {
            resize.observe(element)
            for (const child of Array.from(element.children)) resize.observe(child)
        }
        observeChildren()
        const mutations = new MutationObserver(() => {
            observeChildren()
            measure()
        })
        mutations.observe(element, { childList: true })
        window.addEventListener('resize', measure)

        return () => {
            resize.disconnect()
            mutations.disconnect()
            window.removeEventListener('resize', measure)
        }
    }, [ref])

    return gutter
}
