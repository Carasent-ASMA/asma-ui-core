import { useEffect, useRef, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import { consumerOverrides } from 'src/helpers/classOverride'

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

    // `cn` is plain clsx (tailwind-merge was dropped in Phase 0), so a consumer's padding utility in
    // `className` can't override the hardcoded defaults below: both end up in the class list and
    // Tailwind emits the axis utilities (`px`/`py`) after the `p` shorthand, so `px-0`/`py-2` beat a
    // consumer `p-4` on source order (→ 0 horizontal padding). Drop our defaults when the consumer
    // sets any padding so their className takes effect (e.g. ToolbarFilterPopover's `p-4`).
    const hasCustomPadding = consumerOverrides(className, 'padding')

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
            className={cn(
                'm-0 list-none outline-none',
                !hasCustomPadding && 'px-0',
                !hasCustomPadding && (disablePadding ? 'py-0' : 'py-2'),
                className,
            )}
            style={{ fontFamily: 'Roboto, Helvetica, Arial, sans-serif' }}
            onClick={onClick}
            onKeyDown={handleKeyDown}
        >
            {children}
        </ul>
    )
}
