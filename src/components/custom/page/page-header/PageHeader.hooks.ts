import { useEffect, useRef, useState, type RefObject } from 'react'

/* Behaviour hooks for PageHeader. */

/** Opening search focuses the search slot; closing restores the previously focused
 * element (tracked via focusin — the invoker may already be unmounted), else the heading. */
export function useSearchFocus(
    hasSearch: boolean,
    searchOpen: boolean,
    searchAreaRef: RefObject<HTMLDivElement>,
    headingRef: RefObject<HTMLElement>,
): void {
    const restoreFocusRef = useRef<HTMLElement | null>(null)

    useEffect(() => {
        if (!hasSearch) {
            return
        }
        const remember = (event: FocusEvent) => {
            const target = event.target as HTMLElement | null
            if (target != null && !searchAreaRef.current?.contains(target)) {
                restoreFocusRef.current = target
            }
        }
        document.addEventListener('focusin', remember)
        return () => document.removeEventListener('focusin', remember)
    }, [hasSearch, searchAreaRef])

    useEffect(() => {
        if (searchOpen) {
            searchAreaRef.current
                ?.querySelector<HTMLElement>('input, textarea, [contenteditable="true"], button, [tabindex]')
                ?.focus()
        } else if (restoreFocusRef.current) {
            const stored = restoreFocusRef.current
            const target = stored.isConnected && stored !== document.body ? stored : headingRef.current
            target?.focus()
            restoreFocusRef.current = null
        }
    }, [searchOpen, searchAreaRef, headingRef])
}

/** Header is "stuck" (compact) once the sentinel above it scrolls out of view. */
export function useStuckOnScroll(sticky: boolean, sentinelRef: RefObject<HTMLDivElement>): boolean {
    const [observedStuck, setObservedStuck] = useState(false)

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sticky || !sentinel || typeof IntersectionObserver === 'undefined') {
            return
        }
        const observer = new IntersectionObserver(([entry]) =>
            setObservedStuck(entry != null && !entry.isIntersecting),
        )
        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [sticky, sentinelRef])

    return sticky && observedStuck
}

/** Nearest scrollable ancestor, falling back to the document scroller. */
const findScrollContainer = (element: HTMLElement): HTMLElement => {
    for (let parent = element.parentElement; parent != null; parent = parent.parentElement) {
        const { overflowY } = getComputedStyle(parent)
        if (overflowY === 'auto' || overflowY === 'scroll') {
            return parent
        }
    }
    return document.documentElement
}

/** Writes the header's measured height as scroll-padding-top on the nearest scroll
 * container, so a sticky header never covers focused content. */
export function useStickyScrollPadding(sticky: boolean, containerRef: RefObject<HTMLDivElement>): void {
    useEffect(() => {
        const header = containerRef.current
        if (!sticky || !header || typeof ResizeObserver === 'undefined') {
            return
        }
        const scroller = findScrollContainer(header)
        const previous = scroller.style.scrollPaddingTop
        let applied = previous

        const apply = () => {
            applied = `${Math.ceil(header.getBoundingClientRect().height)}px`
            scroller.style.scrollPaddingTop = applied
        }
        apply()

        const observer = new ResizeObserver(apply)
        observer.observe(header)

        return () => {
            observer.disconnect()
            /* Restore only while we still own the value. */
            if (scroller.style.scrollPaddingTop === applied) {
                scroller.style.scrollPaddingTop = previous
            }
        }
    }, [sticky, containerRef])
}

/** True while the 2-line clamp hides part of the title (drives the native tooltip). */
export function useIsTitleClamped(headingRef: RefObject<HTMLElement>, title: string, enabled: boolean): boolean {
    const [clamped, setClamped] = useState(false)

    useEffect(() => {
        const heading = headingRef.current
        if (!enabled || !heading || typeof ResizeObserver === 'undefined') {
            return
        }
        const measure = () => setClamped(heading.scrollHeight > heading.clientHeight + 1)
        /* Clamp state is post-layout geometry — it cannot be derived at render time. */
        // eslint-disable-next-line react-you-might-not-need-an-effect/no-adjust-state-on-prop-change
        measure()

        const observer = new ResizeObserver(measure)
        observer.observe(heading)
        return () => observer.disconnect()
    }, [headingRef, title, enabled])

    return enabled && clamped
}
