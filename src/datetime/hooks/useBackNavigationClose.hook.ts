import { useEffect } from 'react'

export const useBackNavigationClose = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    useEffect(() => {
        if (!open) return

        window.history.pushState({ modal: true }, '')

        window.addEventListener('popstate', onClose)

        return () => {
            window.removeEventListener('popstate', onClose)

            if (window.history.state?.modal) {
                window.history.back()
            }
        }
    }, [open])

    return null
}
