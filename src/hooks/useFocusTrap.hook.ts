import { useEffect, useRef, type RefObject } from 'react'
import { tabbableWithin } from 'src/helpers/focusable'

/**
 * Manual Tab-cycling focus trap for a modal-like panel that (unlike `StyledDialog`) can't use the
 * native `<dialog>` `showModal()` trap — e.g. a panel that's only modal in ONE of its states
 * (`MinimizableDialog`'s fullscreen mode), where the rest of the time it's a non-modal floating
 * widget that must NOT trap focus. Moves external focus into the container but retains focus on an
 * in-panel control that activated the trap (such as an Enter Fullscreen button), cycles Tab/Shift+Tab
 * among its focusable descendants while `active`, restores focus to the trigger on deactivation,
 * and calls `onEscape` on the Escape key (mirroring `StyledDialog`'s ESC-to-close).
 */
export const useFocusTrap = (active: boolean, containerRef: RefObject<HTMLElement | null>, onEscape?: () => void): void => {
    const onEscapeRef = useRef(onEscape)

    useEffect(() => {
        onEscapeRef.current = onEscape
    }, [onEscape])

    useEffect(() => {
        if (!active) return

        const container = containerRef.current
        if (!container) return

        const previouslyFocused = document.activeElement as HTMLElement | null
        const previousTabIndex = container.getAttribute('tabindex')
        container.setAttribute('tabindex', '-1')

        // A control inside the panel may have activated its modal state. Keep focus on that control
        // so its changed action (e.g. "Exit fullscreen") is immediately available to keyboard users.
        // External activation still follows StyledDialog and enters the modal shell.
        const focusShell = (): void => {
            if (!previouslyFocused || !container.contains(previouslyFocused)) {
                container.focus({ preventScroll: true })
            }
        }
        // Deferred: the container may have just switched into the DOM/layout this render.
        const raf = requestAnimationFrame(focusShell)

        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') {
                onEscapeRef.current?.()
                return
            }
            if (event.key !== 'Tab') return

            const focusable = tabbableWithin(container)
            if (focusable.length === 0) {
                event.preventDefault()
                return
            }

            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            const activeElement = document.activeElement

            // Shell focus sits "before" the first control — Shift+Tab from either wraps to last.
            if (event.shiftKey && (activeElement === first || activeElement === container)) {
                event.preventDefault()
                last?.focus()
            } else if (!event.shiftKey && activeElement === last) {
                event.preventDefault()
                first?.focus()
            } else if (!event.shiftKey && activeElement === container) {
                event.preventDefault()
                first?.focus()
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            cancelAnimationFrame(raf)
            document.removeEventListener('keydown', handleKeyDown)
            if (previousTabIndex === null) container.removeAttribute('tabindex')
            else container.setAttribute('tabindex', previousTabIndex)
            // React runs effect cleanup before it removes this panel, so focus can still appear to
            // be inside it here and only drop to <body> after the commit. Check in the next frame:
            // deactivating fullscreen retains its focused toggle, while an unmounted panel restores
            // the opener instead of stranding focus on <body>.
            requestAnimationFrame(() => {
                const stillFocused = document.activeElement
                const focusWasLost = !stillFocused || stillFocused === document.body
                if (focusWasLost && previouslyFocused && document.contains(previouslyFocused)) {
                    previouslyFocused.focus({ preventScroll: true })
                }
            })
        }
    }, [active, containerRef])
}
