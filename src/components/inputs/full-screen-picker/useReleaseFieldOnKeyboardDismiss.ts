import { useEffect, type RefObject } from 'react'
import { isTextField, isVisualViewportShrunkByKeyboard as isKeyboardUp } from 'src/hooks/useOnScreenKeyboard'

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
