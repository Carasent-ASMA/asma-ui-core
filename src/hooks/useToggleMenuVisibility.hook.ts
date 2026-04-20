import { useState, useCallback } from 'react'

export const useToggleMenuVisibility = (): {
    open: boolean
    handleClose: () => void
    handleOpen: (event: React.MouseEvent<HTMLElement | SVGSVGElement | null>) => void
    anchorEl: HTMLElement | SVGSVGElement | null
} => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | SVGSVGElement | null>(null)
    const [open, setOpen] = useState(false)

    const handleOpen = useCallback((event: React.MouseEvent<HTMLElement | SVGSVGElement | null>) => {
        setAnchorEl(event.currentTarget)
        setOpen(true)
    }, [])

    const handleClose = useCallback(() => {
        setOpen(false)
    }, [])

    return { open, handleClose, handleOpen, anchorEl }
}
