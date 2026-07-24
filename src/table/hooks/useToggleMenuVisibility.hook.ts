import { useState, useCallback } from 'react'

interface ToggleMenuVisibility {
    open: boolean
    anchorEl: HTMLElement | SVGSVGElement | null
    handleOpen: (event: React.MouseEvent<HTMLElement | SVGSVGElement>) => void
    handleClose: () => void
}

export const useToggleMenuVisibility = (): ToggleMenuVisibility => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | SVGSVGElement | null>(null)
    const [open, setOpen] = useState(false)

    const handleOpen = useCallback((event: React.MouseEvent<HTMLElement | SVGSVGElement>) => {
        setAnchorEl(event.currentTarget)
        setOpen(true)
    }, [])

    const handleClose = useCallback(() => {
        setOpen(false)
    }, [])

    return { open, handleClose, handleOpen, anchorEl }
}