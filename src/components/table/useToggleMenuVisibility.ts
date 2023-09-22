import { useState, useCallback } from 'react'

export const useToggleMenuVisibility = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | SVGSVGElement | null>(null)
    const open = Boolean(anchorEl)

    const handleOpen = useCallback((event: React.MouseEvent<HTMLElement | SVGSVGElement>) => {
        setAnchorEl(event.currentTarget)
    }, [])

    const handleClose = useCallback(() => {
        setAnchorEl(null)
    }, [])

    return { open, handleClose, handleOpen, anchorEl }
}
