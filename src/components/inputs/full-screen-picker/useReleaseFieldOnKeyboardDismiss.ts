import { useEffect, type RefObject } from 'react'

/** Shorter than any on-screen keyboard, taller than a browser toolbar sliding in or out. */
const KEYBOARD_MIN_HEIGHT_PX = 150

/**
 * The on-screen keyboard covers part of the layout viewport. iOS Safari and Android Chrome (no
 * `interactive-widget` in the viewport meta) keep `innerHeight` at the full layout height while the
 * visual viewport shrinks above the keyboard. Measured in screen px (`height × scale`), so a pinch
 * zoom does not read as a keyboard.
 */
const isKeyboardUp = (viewport: VisualViewport): boolean =>
    window.innerHeight - viewport.height * viewport.scale >= KEYBOARD_MIN_HEIGHT_PX

const isTextField = (element: Element | null): element is HTMLElement =>
    element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || (element instanceof HTMLElement && element.isContentEditable)

/**
 * Moves focus off the sheet's text field once the on-screen keyboard is put away without a blur —
 * Android Back, a swipe down, the iPad hide key. The rows keep focus where it is on a tap (so a
 * search keeps its keyboard mid-list), so a field still focused under a hidden keyboard would call
 * it back up on every tap on a row. Focus goes to the dialog shell, where a tap opening the picker
 * leaves it.
 *
 * Only the keyboard going from up to down counts: a keyboard closing over several resize steps is
 * still caught, while a rotation with the keyboard up and a hardware keyboard (none ever shows) are not.
 */
export const useReleaseFieldOnKeyboardDismiss = (anchorRef: RefObject<HTMLElement | null>): void => {
    useEffect(() => {
        const viewport = window.visualViewport
        if (!viewport) return undefined
        let keyboardWasUp = isKeyboardUp(viewport)
        const handleResize = (): void => {
            const keyboardUp = isKeyboardUp(viewport)
            const dismissed = keyboardWasUp && !keyboardUp
            keyboardWasUp = keyboardUp
            if (!dismissed) return
            const shell = anchorRef.current?.closest('dialog')
            const field = document.activeElement
            if (shell && isTextField(field) && shell.contains(field)) shell.focus({ preventScroll: true })
        }
        viewport.addEventListener('resize', handleResize)
        return () => viewport.removeEventListener('resize', handleResize)
    }, [anchorRef])
}
