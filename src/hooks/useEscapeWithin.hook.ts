import { useEffect, useRef, type RefObject } from 'react'

/**
 * Escape closes a NON-modal panel (a docked `MinimizableDialog`) while focus is inside it — the
 * WAI-ARIA dialog contract, without the trap. Heard on `window` for the same reason as
 * `StyledDialog`: a menu, select or popover inside the panel claims its Escape first (Floating UI
 * stops propagation, others `preventDefault()`), so only an unclaimed press gets here. A press from
 * a dialog nested inside `container` is left to that dialog.
 */
export const useEscapeWithin = (active: boolean, containerRef: RefObject<HTMLElement | null>, onEscape: () => void): void => {
    const onEscapeRef = useRef(onEscape)

    useEffect(() => {
        onEscapeRef.current = onEscape
    }, [onEscape])

    useEffect(() => {
        if (!active) return
        const closeOnEscape = (event: KeyboardEvent): void => {
            if (event.key !== 'Escape' || event.defaultPrevented) return
            const container = containerRef.current
            const target = event.target
            if (!container || !(target instanceof Element) || !container.contains(target)) return
            const nearestDialog = target.closest('dialog, [role="dialog"], [role="alertdialog"]')
            if (nearestDialog && nearestDialog !== container && container.contains(nearestDialog)) return
            event.preventDefault()
            onEscapeRef.current()
        }
        window.addEventListener('keydown', closeOnEscape)
        return () => window.removeEventListener('keydown', closeOnEscape)
    }, [active, containerRef])
}
