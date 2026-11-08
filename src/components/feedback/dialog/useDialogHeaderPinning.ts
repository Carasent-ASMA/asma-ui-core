import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { useElementHeightPx } from 'src/hooks/useElementHeightPx'
import { useLayoutViewportHeight } from 'src/hooks/useLayoutViewportHeight'
import { useShortScreenMediaQuery } from 'src/hooks/useMediaQuery.hook'
import { useOnScreenKeyboardOpen } from 'src/hooks/useOnScreenKeyboard'

/** A pinned header may take at most this share of the layout viewport height (ASMA-8737). */
export const PINNED_HEADER_MAX_VIEWPORT_SHARE = 0.25

export interface DialogHeaderPinning {
    /** Attach to the header: its measured height is `H`. */
    headerRef: (element: HTMLElement | null) => void
    /** Pinned (`position: sticky`) rather than scrolling with the body. */
    pinned: boolean
    /** Pinned but stepped aside for the on-screen keyboard (PIN-7): `inert`, `aria-hidden`, not rendered. */
    hidden: boolean
    /** Measured header height reserved as `scroll-padding-top` on the scroller (PIN-8); 0 when not pinned. */
    scrollPaddingTop: number
    /** Measured sticky-footer height reserved as `scroll-padding-bottom` on the scroller (PIN-8); 0 when absent. */
    scrollPaddingBottom: number
}

/**
 * Tracks the document's focused element and re-renders when focus moves.
 *
 * `useOnScreenKeyboardOpen` only tells us that *some* text field has focus. PIN-7 needs to know
 * *which* bar holds it, and moving from the content to a field inside the header changes that answer
 * without changing whether the keyboard is open. `relatedTarget` is where focus is going: inside
 * `focusout`, `document.activeElement` can still be the element that is losing focus.
 */
const useFocusedElement = (): Element | null => {
    const [focusedElement, setFocusedElement] = useState<Element | null>(() =>
        typeof document === 'undefined' ? null : document.activeElement,
    )

    useLayoutEffect(() => {
        const onFocusIn = (event: FocusEvent): void => setFocusedElement(event.target as Element)
        const onFocusOut = (event: FocusEvent): void => setFocusedElement(event.relatedTarget as Element | null)
        document.addEventListener('focusin', onFocusIn)
        document.addEventListener('focusout', onFocusOut)
        return () => {
            document.removeEventListener('focusin', onFocusIn)
            document.removeEventListener('focusout', onFocusOut)
        }
    }, [])

    return focusedElement
}

/** A footer only overlays the scroller while it is actually sticky; in flow it already takes its space. */
const stickyHeight = (element: HTMLElement): number =>
    getComputedStyle(element).position === 'sticky' ? Math.round(element.getBoundingClientRect().height) : 0

/** Tracks an element's rendered height with a `ResizeObserver`, synchronously before first paint. */
const useMeasuredHeight = (element: HTMLElement | null, measureHeight: (element: HTMLElement) => number): number => {
    const [heightPx, setHeightPx] = useState(0)

    useLayoutEffect(() => {
        if (!element) return undefined

        let rafId = 0
        const commit = (): void => {
            const next = measureHeight(element)
            setHeightPx((prev) => (prev === next ? prev : next))
        }
        const measure = (): void => {
            cancelAnimationFrame(rafId)
            rafId = requestAnimationFrame(commit)
        }

        commit()

        if (typeof ResizeObserver === 'undefined') return () => cancelAnimationFrame(rafId)

        const observer = new ResizeObserver(measure)
        observer.observe(element)
        return () => {
            cancelAnimationFrame(rafId)
            observer.disconnect()
        }
    }, [element, measureHeight])

    return element ? heightPx : 0
}

/**
 * The sticky footer's occupied height, for `scroll-padding-bottom` (PIN-8).
 *
 * The footer must belong to THIS scroller: a nested dialog's footer sits in that dialog's own
 * `[data-dialog-body]`, so `closest()` keeps its height out of the outer body's padding. A wrapper
 * around the footer is fine — the sticky rule itself is descendant-based. `position: sticky` is
 * checked because a footer left in normal flow takes real space at the end of the content and must
 * not be reserved twice.
 */
const useStickyFooterHeight = (scrollerRef: RefObject<HTMLElement>): number => {
    const [footerElement, setFooterElement] = useState<HTMLElement | null>(null)

    // The footer is consumer-rendered, so it can appear, disappear or be replaced on any commit.
    // A dependency array cannot express that; `setFooterElement` bails out unless the node changed.
    useLayoutEffect(() => {
        const discoverFooter = (): void => {
            const scroller = scrollerRef.current
            let next: HTMLElement | null = null
            if (scroller) {
                next =
                    Array.from(scroller.querySelectorAll<HTMLElement>('[data-dialog-footer]')).find(
                        (footer) => footer.closest('[data-dialog-body]') === scroller,
                    ) ?? null
            }
            setFooterElement((prev) => (prev === next ? prev : next))
        }
        discoverFooter()
    })

    return useMeasuredHeight(footerElement, stickyHeight)
}

/**
 * The shared pinning decision for dialog headers (ASMA-8737, pinned bars PIN-1/2/7/8): pinned only
 * when the screen is taller than `30em` **and** the measured header is at most 25% of
 * `window.innerHeight`; otherwise it scrolls with the body.
 *
 * `H` is measured on the header itself, and pinning changes only its `position`, so the decision
 * cannot feed back into `H`. The visual viewport never enters the decision: the on-screen keyboard
 * only hides a pinned header, it never unpins one. A hidden header measures 0 and so stays pinned
 * until the keyboard goes, which keeps that switch loop-free too.
 *
 * PIN-7's exception is part of the decision: a header that contains the focused field is the bar the
 * user is typing in, so it stays visible (and in the accessibility tree) while the keyboard is open.
 *
 * Hiding or showing the header moves the content by `H`; the focused element is brought back into
 * view afterwards, inside the scroll padding.
 */
export const useDialogHeaderPinning = (scrollerRef: RefObject<HTMLElement>): DialogHeaderPinning => {
    const isShortScreen = useShortScreenMediaQuery()
    const viewportHeight = useLayoutViewportHeight()
    const keyboardOpen = useOnScreenKeyboardOpen()
    const { ref: measureHeaderRef, heightPx } = useElementHeightPx<HTMLElement>()
    const [headerElement, setHeaderElement] = useState<HTMLElement | null>(null)
    const focusedElement = useFocusedElement()
    const footerHeightPx = useStickyFooterHeight(scrollerRef)

    const headerRef = useCallback(
        (element: HTMLElement | null): void => {
            setHeaderElement(element)
            measureHeaderRef(element)
        },
        [measureHeaderRef],
    )

    const pinned = !isShortScreen && heightPx <= viewportHeight * PINNED_HEADER_MAX_VIEWPORT_SHARE
    const headerHasFocus = !!headerElement && !!focusedElement && headerElement.contains(focusedElement)
    const hidden = pinned && keyboardOpen && !headerHasFocus

    const wasHiddenRef = useRef(hidden)
    useLayoutEffect(() => {
        if (wasHiddenRef.current === hidden) return
        wasHiddenRef.current = hidden
        const scroller = scrollerRef.current
        const focused = document.activeElement
        if (scroller && focused instanceof HTMLElement && focused !== scroller && scroller.contains(focused)) {
            focused.scrollIntoView({ block: 'nearest' })
        }
    }, [hidden, scrollerRef])

    return {
        headerRef,
        pinned,
        hidden,
        scrollPaddingTop: pinned && !hidden ? heightPx : 0,
        scrollPaddingBottom: footerHeightPx,
    }
}
