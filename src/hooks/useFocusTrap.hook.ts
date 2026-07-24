import { useEffect, type RefObject } from 'react'

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Manual Tab-cycling focus trap for a modal-like panel that (unlike `StyledDialog`) can't use the
 * native `<dialog>` `showModal()` trap — e.g. a panel that's only modal in ONE of its states
 * (`MinimizableDialog`'s fullscreen mode), where the rest of the time it's a non-modal floating
 * widget that must NOT trap focus. Moves initial focus into the container, cycles Tab/Shift+Tab
 * among its focusable descendants while `active`, restores focus to the trigger on deactivation,
 * and calls `onEscape` on the Escape key (mirroring `StyledDialog`'s ESC-to-close).
 */
export const useFocusTrap = (active: boolean, containerRef: RefObject<HTMLElement | null>, onEscape?: () => void): void => {
    useEffect(() => {
        if (!active) return

        const container = containerRef.current
        if (!container) return

        const previouslyFocused = document.activeElement as HTMLElement | null

        const focusFirst = (): void => {
            const first = container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
            ;(first ?? container).focus()
        }
        // Deferred: the container may have just switched into the DOM/layout this render.
        const raf = requestAnimationFrame(focusFirst)

        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') {
                onEscape?.()
                return
            }
            if (event.key !== 'Tab') return

            const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
            if (focusable.length === 0) {
                event.preventDefault()
                return
            }

            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            const activeElement = document.activeElement

            if (event.shiftKey && activeElement === first) {
                event.preventDefault()
                last?.focus()
            } else if (!event.shiftKey && activeElement === last) {
                event.preventDefault()
                first?.focus()
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            cancelAnimationFrame(raf)
            document.removeEventListener('keydown', handleKeyDown)
            if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus()
        }
    }, [active, containerRef, onEscape])
}
