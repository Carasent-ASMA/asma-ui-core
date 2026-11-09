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
 * Tracks the document's focused element while `enabled`, re-rendering when focus moves; `null` otherwise.
 *
 * `useOnScreenKeyboardOpen` only tells us that *some* text field has focus. PIN-7 needs to know
 * *which* bar holds it, and moving from the content to a field inside the header changes that answer
 * without changing whether the keyboard is open. Only listened to while the keyboard is open, so focus
 * moving elsewhere in the page does not re-render every mounted dialog. `relatedTarget` is where focus is
 * going: inside `focusout`, `document.activeElement` can still be the element that is losing focus.
 */
const useFocusedElement = (enabled: boolean): Element | null => {
    const [focusedElement, setFocusedElement] = useState<Element | null | undefined>(undefined)

    useLayoutEffect(() => {
        if (!enabled) return undefined
        const onFocusIn = (event: FocusEvent): void => setFocusedElement(event.target as Element)
        const onFocusOut = (event: FocusEvent): void => setFocusedElement(event.relatedTarget as Element | null)
        document.addEventListener('focusin', onFocusIn)
        document.addEventListener('focusout', onFocusOut)
        return () => {
            document.removeEventListener('focusin', onFocusIn)
            document.removeEventListener('focusout', onFocusOut)
            setFocusedElement(undefined)
        }
    }, [enabled])

    if (!enabled) return null
    // Until the first focus event after enabling, the focus is wherever it was when the keyboard opened.
    return focusedElement === undefined ? document.activeElement : focusedElement
}

/** A footer only overlays the scroller while it is actually sticky; in flow it already takes its space. */
const stickyFooterHeight = (element: HTMLElement): number =>
    getComputedStyle(element).position === 'sticky' ? Math.round(element.getBoundingClientRect().height) : 0

/** A header stepped aside for the keyboard measures 0; keep its last height so the decision and padding hold. */
const visibleHeaderHeight = (element: HTMLElement): number | null =>
    element.hidden ? null : Math.round(element.getBoundingClientRect().height)

/** The footer that belongs to THIS scroller: a nested dialog's footer sits in that dialog's own body. */
const findOwnFooter = (scroller: HTMLElement): HTMLElement | null =>
    Array.from(scroller.querySelectorAll<HTMLElement>('[data-dialog-footer]')).find(
        (footer) => footer.closest('[data-dialog-body]') === scroller,
    ) ?? null

/**
 * The sticky footer's occupied height, for `scroll-padding-bottom` (PIN-8).
 *
 * The footer is consumer-rendered and can mount, unmount or be replaced by descendant state the dialog
 * never re-renders for, so the scroller's subtree is observed rather than re-scanned on every render. A
 * wrapper around the footer is fine — the sticky rule itself is descendant-based. `position: sticky` is
 * checked because a footer left in normal flow takes real space at the end of the content and must not
 * be reserved twice.
 */
const useStickyFooterHeight = (scrollerRef: RefObject<HTMLElement>): number => {
    const { ref: footerRef, heightPx } = useElementHeightPx<HTMLElement>(stickyFooterHeight)
    const observedRef = useRef<{ scroller: HTMLElement; observer?: MutationObserver } | null>(null)

    // The ref object is stable but its node is only known after commit, so (re)attach when it changes.
    useLayoutEffect(() => {
        const scroller = scrollerRef.current
        if (observedRef.current?.scroller === scroller) return
        observedRef.current?.observer?.disconnect()
        observedRef.current = null
        if (!scroller) return footerRef(null)
        const discoverFooter = (): void => footerRef(findOwnFooter(scroller))
        discoverFooter()
        const observer = typeof MutationObserver === 'undefined' ? undefined : new MutationObserver(discoverFooter)
        observer?.observe(scroller, { childList: true, subtree: true })
        observedRef.current = { scroller, observer }
    })
    useLayoutEffect(() => () => observedRef.current?.observer?.disconnect(), [])

    return heightPx
}

/**
 * The shared pinning decision for dialog headers (ASMA-8737, pinned bars PIN-1/2/7/8): pinned only
 * when the screen is taller than `30em` **and** the measured header is at most 25% of
 * `window.innerHeight`; otherwise it scrolls with the body.
 *
 * `H` is measured on the header itself, and pinning changes only its `position`, so the decision
 * cannot feed back into `H`. The visual viewport never enters the decision: the on-screen keyboard
 * only hides a pinned header, it never unpins one. A hidden header keeps its last measured height, so
 * it stays pinned and reserves the same padding the moment the keyboard goes.
 *
 * PIN-7's exception is part of the decision: a header that contains the focused field is the bar the
 * user is typing in, so it stays visible (and in the accessibility tree) while the keyboard is open.
 * A hidden header also leaves the tab order (`inert`).
 *
 * Hiding or showing the header moves the content by `H`; the focused element is brought back into
 * view afterwards, inside the scroll padding.
 */
export const useDialogHeaderPinning = (scrollerRef: RefObject<HTMLElement>): DialogHeaderPinning => {
    const isShortScreen = useShortScreenMediaQuery()
    const viewportHeight = useLayoutViewportHeight()
    const keyboardOpen = useOnScreenKeyboardOpen()
    const { ref: measureHeaderRef, heightPx } = useElementHeightPx<HTMLElement>(visibleHeaderHeight)
    const [headerElement, setHeaderElement] = useState<HTMLElement | null>(null)
    const footerHeightPx = useStickyFooterHeight(scrollerRef)

    const headerRef = useCallback(
        (element: HTMLElement | null): void => {
            setHeaderElement(element)
            measureHeaderRef(element)
        },
        [measureHeaderRef],
    )

    const pinned = !isShortScreen && heightPx <= viewportHeight * PINNED_HEADER_MAX_VIEWPORT_SHARE
    const focusedElement = useFocusedElement(pinned && keyboardOpen)
    const headerHasFocus = !!headerElement && !!focusedElement && headerElement.contains(focusedElement)
    const hidden = pinned && keyboardOpen && !headerHasFocus

    // React 18 has no boolean `inert` (`inert={false}` still renders an inert element), so it is toggled here.
    useLayoutEffect(() => {
        headerElement?.toggleAttribute('inert', hidden)
    }, [headerElement, hidden])

    const wasHiddenRef = useRef(hidden)
    useLayoutEffect(() => {
        if (wasHiddenRef.current === hidden) return
        wasHiddenRef.current = hidden
        const scroller = scrollerRef.current
        const focused = document.activeElement
        // Only this dialog's own field: one in a nested dialog belongs to that dialog's scroller.
        if (scroller && focused instanceof HTMLElement && focused !== scroller && focused.closest('[data-dialog-body]') === scroller) {
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
