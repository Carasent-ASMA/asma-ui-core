import { useEffect, useRef } from 'react'

const LEGACY_PICKER_BACK_MARKER = '__asmaPickerBack'

/** Keeps the pre-adapter picker Back behavior while the host rollout flag is off. */
export const useBackNavigationClose = ({ open, onClose }: { open: boolean; onClose: () => void }): void => {
    const onCloseRef = useRef(onClose)
    useEffect(() => {
        onCloseRef.current = onClose
    }, [onClose])

    useEffect(() => {
        if (!open) return undefined

        const win = window.rawWindow ?? window
        const marker = crypto.randomUUID()
        const close = (): void => onCloseRef.current()
        win.history.pushState({ ...win.history.state, [LEGACY_PICKER_BACK_MARKER]: marker }, '', win.location.href)
        win.addEventListener('popstate', close)

        return () => {
            win.removeEventListener('popstate', close)
            if ((win.history.state as Record<string, unknown> | null)?.[LEGACY_PICKER_BACK_MARKER] === marker) {
                win.history.back()
            }
        }
    }, [open])
}
