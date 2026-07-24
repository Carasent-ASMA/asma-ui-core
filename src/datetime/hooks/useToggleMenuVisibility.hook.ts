import { useState, useCallback } from 'react'

interface ToggleMenuVisibility {
    open: boolean
    anchorEl: HTMLElement | SVGSVGElement | null
    handleOpen: (event: React.MouseEvent<HTMLElement | SVGSVGElement>) => void
    handleClose: () => void
}

export const useToggleMenuVisibility = (): ToggleMenuVisibility => {
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
