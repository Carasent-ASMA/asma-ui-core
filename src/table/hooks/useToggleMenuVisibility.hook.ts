import { useCallback, useRef, useState, type KeyboardEvent, type MouseEvent, type RefObject } from 'react'

interface ToggleMenuVisibility {
    open: boolean
    anchorEl: HTMLElement | SVGSVGElement | null
    handleOpen: (event: MouseEvent<HTMLElement | SVGSVGElement> | KeyboardEvent<HTMLElement>) => void
    handleClose: () => void
}

interface KeyboardSelectMenu extends ToggleMenuVisibility {
    triggerRef: RefObject<HTMLButtonElement>
    activeIndex: number | null
    handleKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
}

interface KeyboardSelectMenuOptions {
    optionCount: number
    selectedIndex: number
    onSelect: (index: number) => void
    focusHeaderOnShiftTab?: boolean
}

const focusClosestTableHeader = (trigger: HTMLElement | null): boolean => {
    let container = trigger?.parentElement
    while (container) {
        const header = container.querySelector<HTMLTableRowElement>('table thead tr[tabindex="0"]')
        if (header) {
            header.focus()
            return true
        }
        container = container.parentElement
    }
    return false
}

export const useToggleMenuVisibility = (): ToggleMenuVisibility => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | SVGSVGElement | null>(null)
    const [open, setOpen] = useState(false)

    const handleOpen = useCallback(
        (event: MouseEvent<HTMLElement | SVGSVGElement> | KeyboardEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget)
            setOpen(true)
        },
        [],
    )
    const handleClose = useCallback(() => setOpen(false), [])

    return { open, handleClose, handleOpen, anchorEl }
}

export const useKeyboardSelectMenu = ({
    optionCount,
    selectedIndex,
    onSelect,
    focusHeaderOnShiftTab = false,
}: KeyboardSelectMenuOptions): KeyboardSelectMenu => {
    const { open, anchorEl, handleOpen, handleClose: closeMenu } = useToggleMenuVisibility()
    const triggerRef = useRef<HTMLButtonElement>(null)
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    const handleClose = useCallback(() => {
        closeMenu()
        setActiveIndex(null)
    }, [closeMenu])

    const moveActiveOption = useCallback(
        (direction: -1 | 1) => {
            if (optionCount === 0) return
            setActiveIndex((current) =>
                Math.min(Math.max((current ?? selectedIndex) + direction, 0), optionCount - 1),
            )
        },
        [optionCount, selectedIndex],
    )

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLButtonElement>) => {
            if (
                focusHeaderOnShiftTab &&
                event.key === 'Tab' &&
                event.shiftKey &&
                focusClosestTableHeader(triggerRef.current)
            ) {
                event.preventDefault()
                handleClose()
                return
            }

            if (!open && ['Enter', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
                event.preventDefault()
                handleOpen(event)
                if (event.key !== 'Enter') moveActiveOption(event.key === 'ArrowDown' ? 1 : -1)
                return
            }
            if (!open) return

            switch (event.key) {
                case 'ArrowDown':
                case 'ArrowUp':
                    event.preventDefault()
                    moveActiveOption(event.key === 'ArrowDown' ? 1 : -1)
                    break
                case 'Home':
                case 'End':
                    event.preventDefault()
                    setActiveIndex(event.key === 'Home' ? 0 : optionCount ? optionCount - 1 : null)
                    break
                case ' ':
                case 'Enter':
                    if (activeIndex === null) break
                    event.preventDefault()
                    onSelect(activeIndex)
                    if (event.key === 'Enter') {
                        handleClose()
                    }
                    break
                case 'Escape':
                    event.preventDefault()
                    handleClose()
                    triggerRef.current?.focus()
                    break
                case 'Tab':
                    handleClose()
            }
        },
        [
            activeIndex,
            focusHeaderOnShiftTab,
            handleClose,
            handleOpen,
            moveActiveOption,
            onSelect,
            open,
            optionCount,
        ],
    )

    return { open, handleClose, handleOpen, anchorEl, triggerRef, activeIndex, handleKeyDown }
}