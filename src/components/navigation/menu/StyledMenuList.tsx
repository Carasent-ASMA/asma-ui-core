import { useEffect, useLayoutEffect, useRef, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import styles from './StyledMenu.module.scss'
import { cn } from 'src/helpers/cn'
import { consumerOverrides } from 'src/helpers/classOverride'

export interface StyledMenuListProps {
    children?: ReactNode
    id?: string
    role?: 'menu' | 'listbox'
    className?: string
    /** Focus the first enabled item on mount (MUI Menu autoFocus behaviour). */
    autoFocus?: boolean
    /** Drop the default vertical padding (MUI `disablePadding`). */
    disablePadding?: boolean
    onClick?: (event: MouseEvent<HTMLUListElement>) => void
    onKeyDown?: (event: KeyboardEvent<HTMLUListElement>) => void
}

const LIST_SELECTOR = '[role="menu"], [role="listbox"]'
const ITEM_SELECTOR = '[role="menuitem"]'

// Inspect rendered structure, not React children: fragments and tooltip/component wrappers are
// transparent, while custom content, explicit dividers and nested lists break a run of rows.
// `hidden` nodes are skipped rather than treated as content: several consumer menus park a
// `<input hidden>` file picker between rows, which would otherwise strip the separator above it.
// The recursion already evaluates every level on the way down, so no ancestor walk is needed.
const rowSequence = (parent: HTMLElement): (HTMLElement | null)[] =>
    Array.from(parent.childNodes).flatMap((node): (HTMLElement | null)[] => {
        if (!(node instanceof HTMLElement)) return node.textContent?.trim() ? [null] : []
        if (node.hidden) return []
        if (node.matches(LIST_SELECTOR)) return [null]
        if (node.matches(ITEM_SELECTOR)) return [node]
        if (node.querySelector(ITEM_SELECTOR)) return rowSequence(node)
        return [null]
    })

const focusableItems = (list: HTMLUListElement | null): HTMLElement[] =>
    list ? Array.from(list.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')) : []

/**
 * Keyboard-navigable `role="menu"` list (replaces MUI `MenuList`). Arrow-key / Home / End roving
 * focus over enabled `[role="menuitem"]` children. TASK-303.
 */
export const StyledMenuList = ({
    children,
    id,
    role = 'menu',
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

    useLayoutEffect(() => {
        const list = listRef.current
        if (!list) return
        const syncRows = (): void => {
            const sequence = rowSequence(list)
            Array.from(list.querySelectorAll<HTMLElement>(ITEM_SELECTOR))
                .filter((row) => row.closest(LIST_SELECTOR) === list)
                .forEach((row) => row.removeAttribute('data-menu-separator'))
            // Every row except the last visible one in its run gets the line.
            sequence.forEach((row, index) => row?.toggleAttribute('data-menu-separator', !!sequence[index + 1]))
        }
        syncRows()
        const observer = new MutationObserver(syncRows)
        observer.observe(list, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] })
        return () => observer.disconnect()
    }, [])

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

    const listProps = {
        id,
        className: cn(
            styles['list'],
            'm-0 list-none outline-none',
            !hasCustomPadding && 'px-0',
            !hasCustomPadding && (disablePadding ? 'py-0' : 'py-2'),
            className,
        ),
        style: { fontFamily: 'Roboto, Helvetica, Arial, sans-serif' },
        onClick,
        onKeyDown: handleKeyDown,
    }

    return role === 'listbox' ? (
        <ul ref={listRef} {...listProps} role='listbox'>
            {children}
        </ul>
    ) : (
        <ul ref={listRef} {...listProps} role='menu'>
            {children}
        </ul>
    )
}
