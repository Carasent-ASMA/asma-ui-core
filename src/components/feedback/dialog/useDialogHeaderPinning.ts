import { useLayoutEffect, useRef, type RefObject } from 'react'
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
 * Hiding or showing the header moves the content by `H`; the focused element is brought back into
 * view afterwards, inside the scroll padding.
 */
export const useDialogHeaderPinning = (scrollerRef: RefObject<HTMLElement>): DialogHeaderPinning => {
    const isShortScreen = useShortScreenMediaQuery()
    const viewportHeight = useLayoutViewportHeight()
    const keyboardOpen = useOnScreenKeyboardOpen()
    const { ref: headerRef, heightPx } = useElementHeightPx<HTMLElement>()

    const pinned = !isShortScreen && heightPx <= viewportHeight * PINNED_HEADER_MAX_VIEWPORT_SHARE
    const hidden = pinned && keyboardOpen

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

    return { headerRef, pinned, hidden, scrollPaddingTop: pinned && !hidden ? heightPx : 0 }
}
