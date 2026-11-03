import { useCallback, useRef, useState, type KeyboardEvent, type MouseEvent, type RefObject } from 'react'
import { getActiveBodyRow } from 'src/table/helpers/headerControls'

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
    focusTableOnShiftTab?: boolean
}

/**
 * Shift+Tab from a control after the table, such as the footer's row count, goes back into the table at its roving
 * tab stop: the active body row. The header row used to be that stop; it is not one any more (ASMA-8702), and the
 * rows' own controls would otherwise be the browser's previous stop.
 */
const focusClosestTableRows = (trigger: HTMLElement | null): boolean => {
    let container = trigger?.parentElement
    while (container) {
        const row = getActiveBodyRow(container.querySelector<HTMLTableElement>('table'))
        if (row) {
            row.focus()
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
    focusTableOnShiftTab = false,
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
                focusTableOnShiftTab &&
                event.key === 'Tab' &&
                event.shiftKey &&
                focusClosestTableRows(triggerRef.current)
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
            focusTableOnShiftTab,
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