import { useEffect } from 'react'

export const useBackNavigationClose = ({ open, onClose }: { open: boolean; onClose: () => void }): null => {
    useEffect(() => {
        if (!open) return

        window.history.pushState({ modal: true }, '')

        window.addEventListener('popstate', onClose)

        return () => {
            window.removeEventListener('popstate', onClose)

            const state = window.history.state as { modal?: boolean } | null
            if (state?.modal) {
                window.history.back()
            }
        }
    }, [open])

    return null
}
