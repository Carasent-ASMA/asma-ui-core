import { useEffect, useRef, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { cn } from 'src/helpers/cn'

export interface StyledMenuListProps {
    children?: ReactNode
    className?: string
    /** Focus the first enabled item on mount (MUI Menu autoFocus behaviour). */
    autoFocus?: boolean
    /** Drop the default vertical padding (MUI `disablePadding`). */
    disablePadding?: boolean
    onClick?: (event: MouseEvent<HTMLUListElement>) => void
    onKeyDown?: (event: KeyboardEvent<HTMLUListElement>) => void
}

const focusableItems = (list: HTMLUListElement | null): HTMLElement[] =>
    list ? Array.from(list.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')) : []

/**
 * Keyboard-navigable `role="menu"` list (replaces MUI `MenuList`). Arrow-key / Home / End roving
 * focus over enabled `[role="menuitem"]` children. TASK-303.
 */
export const StyledMenuList = ({
    children,
    className,
    autoFocus,
    disablePadding,
    onClick,
    onKeyDown,
}: StyledMenuListProps): JSX.Element => {
    const listRef = useRef<HTMLUListElement>(null)

    useEffect(() => {
        if (autoFocus) focusableItems(listRef.current)[0]?.focus()
    }, [autoFocus])

    const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>): void => {
        onKeyDown?.(event)
        const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End']
        if (!keys.includes(event.key)) return
        event.preventDefault()
        const items = focusableItems(listRef.current)
        if (items.length === 0) return
        const activeIndex = items.findIndex((n) => n === document.activeElement)
        let nextIndex = activeIndex
        if (event.key === 'ArrowDown') nextIndex = (activeIndex + 1) % items.length
        else if (event.key === 'ArrowUp') nextIndex = (activeIndex - 1 + items.length) % items.length
        else if (event.key === 'Home') nextIndex = 0
        else if (event.key === 'End') nextIndex = items.length - 1
        items[nextIndex]?.focus()
    }

    return (
        <ul
            ref={listRef}
            role='menu'
            className={cn('m-0 list-none px-0 outline-none', disablePadding ? 'py-0' : 'py-2', className)}
            style={{ fontFamily: 'Roboto, Helvetica, Arial, sans-serif' }}
            onClick={onClick}
            onKeyDown={handleKeyDown}
        >
            {children}
        </ul>
    )
}
