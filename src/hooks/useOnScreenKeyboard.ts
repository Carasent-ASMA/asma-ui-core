import { useSyncExternalStore } from 'react'

/** Shorter than any on-screen keyboard, taller than a browser toolbar sliding in or out. */
const KEYBOARD_MIN_HEIGHT_PX = 150

/**
 * The visual viewport has shrunk by at least a keyboard's height. iOS Safari and Android Chrome (no
 * `interactive-widget` in the viewport meta) keep `innerHeight` at the full layout height while the
 * visual viewport shrinks above the keyboard. Measured in screen px (`height × scale`), so a pinch
 * zoom does not read as a keyboard.
 */
export const isVisualViewportShrunkByKeyboard = (
    viewport: VisualViewport | null | undefined = typeof window === 'undefined' ? undefined : window.visualViewport,
): boolean => !!viewport && window.innerHeight - viewport.height * viewport.scale >= KEYBOARD_MIN_HEIGHT_PX

/** An element that brings up the on-screen keyboard when focused. */
export const isTextField = (element: Element | null): element is HTMLElement => {
    if (typeof HTMLElement === 'undefined' || !(element instanceof HTMLElement) || element.inputMode === 'none') return false
    if (element instanceof HTMLTextAreaElement) return true
    if (element.isContentEditable) return true
    if (!(element instanceof HTMLInputElement)) return false
    return !['button', 'checkbox', 'color', 'file', 'hidden', 'image', 'radio', 'range', 'reset', 'submit'].includes(element.type)
}

/**
 * The on-screen keyboard is open: a text field has focus **and** the visual viewport has shrunk by at
 * least a keyboard's height. Both are needed: a hardware keyboard never shrinks the viewport, and a
 * shrunk viewport with no text field focused is a browser toolbar or split screen, not a keyboard.
 */
export const isOnScreenKeyboardOpen = (): boolean =>
    typeof document !== 'undefined' && isTextField(document.activeElement) && isVisualViewportShrunkByKeyboard()

const subscribe = (callback: () => void): (() => void) => {
    const viewport = window.visualViewport
    viewport?.addEventListener('resize', callback)
    window.addEventListener('resize', callback)
    // Focus moving in or out of a text field changes the answer without any resize.
    document.addEventListener('focusin', callback)
    document.addEventListener('focusout', callback)
    return () => {
        viewport?.removeEventListener('resize', callback)
        window.removeEventListener('resize', callback)
        document.removeEventListener('focusin', callback)
        document.removeEventListener('focusout', callback)
    }
}

const getServerSnapshot = (): boolean => false

/**
 * Shared on-screen keyboard detection (pinned bars PIN-7, ASMA-8737). Use it to step a pinned bar
 * out of the way while the user types; never use the visual viewport to size the layout decision
 * itself, which is made against `window.innerHeight`.
 */
export const useOnScreenKeyboardOpen = (): boolean => useSyncExternalStore(subscribe, isOnScreenKeyboardOpen, getServerSnapshot)
