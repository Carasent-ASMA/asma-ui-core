import {
    useEffect,
    useLayoutEffect,
    useRef,
    type FocusEvent,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
} from 'react'
import styles from './StyledMenu.module.scss'
import { cn } from 'src/helpers/cn'
import { consumerOverrides } from 'src/helpers/classOverride'

export interface StyledMenuListProps {
    /** @figmaProp Type = Scroll; auto caps lists with more than six shared rows. */
    scroll?: boolean | 'auto'
    /** @figmaProp Menus surface — opt in for an unanchored list (StyledMenu supplies its own). */
    surface?: boolean
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
const ITEM_SELECTOR = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]'

// Single-line fields whose ArrowUp/ArrowDown have no native meaning, so the list may take them to
// step into the rows. Spinners (number, date, time) and multiline fields keep their arrows.
const SINGLE_LINE_INPUT_TYPES = ['text', 'search', 'email', 'tel', 'url', 'password']
const isSingleLineTextInput = (element: Element): boolean =>
    element instanceof HTMLInputElement && SINGLE_LINE_INPUT_TYPES.includes(element.type)

const isHiddenWithin = (element: HTMLElement, boundary: HTMLElement): boolean => {
    for (let current: HTMLElement | null = element; current && current !== boundary; current = current.parentElement) {
        const style = getComputedStyle(current)
        if (
            current.hidden ||
            current.getAttribute('aria-hidden') === 'true' ||
            style.display === 'none' ||
            style.visibility === 'hidden'
        )
            return true
    }
    return false
}

// Inspect rendered structure, not React children: fragments and tooltip/component wrappers are
// transparent, while custom content, explicit dividers and nested lists break a run of rows.
const rowSequence = (parent: HTMLElement, boundary = parent): (HTMLElement | null)[] =>
    Array.from(parent.childNodes).flatMap((node): (HTMLElement | null)[] => {
        if (!(node instanceof HTMLElement)) return node.textContent?.trim() ? [null] : []
        if (isHiddenWithin(node, boundary)) return []
        if (node.matches(LIST_SELECTOR)) return [null]
        if (node.hasAttribute('data-menu-row')) return [node]
        if (node.querySelector('[data-menu-row]')) return rowSequence(node, boundary)
        return [null]
    })

const focusableItems = (list: HTMLUListElement | null): HTMLElement[] =>
    list
        ? Array.from(list.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
              (item) =>
                  item.closest(LIST_SELECTOR) === list &&
                  item.getAttribute('aria-disabled') !== 'true' &&
                  !isHiddenWithin(item, list),
          )
        : []

const setSurfaceTabStop = (list: HTMLUListElement, requested?: HTMLElement): void => {
    const enabled = focusableItems(list)
    const tabStop =
        (requested && enabled.includes(requested) ? requested : undefined) ??
        enabled.find((item) => item.tabIndex === 0) ??
        enabled[0]
    Array.from(list.querySelectorAll<HTMLElement>(ITEM_SELECTOR))
        .filter((item) => item.closest(LIST_SELECTOR) === list)
        .forEach((item) => {
            item.tabIndex = item === tabStop ? 0 : -1
        })
}

/**
 * Keyboard-navigable `role="menu"` list (replaces MUI `MenuList`). Arrow-key / Home / End roving
 * focus over enabled `[role="menuitem"]` children. TASK-303.
 */
export const StyledMenuList = ({
    children,
    scroll = 'auto',
    surface,
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
            Array.from(list.querySelectorAll<HTMLElement>('[data-menu-row]'))
                .filter((row) => row.closest(LIST_SELECTOR) === list)
                .forEach((row) => row.removeAttribute('data-menu-separator'))
            list.toggleAttribute(
                'data-menu-scroll',
                scroll === true || (scroll === 'auto' && sequence.filter(Boolean).length > 6),
            )
            sequence.forEach((row, index) => row?.toggleAttribute('data-menu-separator', !!sequence[index + 1]))
            if (surface) setSurfaceTabStop(list)
        }
        syncRows()
        const observer = new MutationObserver(syncRows)
        observer.observe(list, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['hidden', 'aria-hidden', 'aria-disabled', 'class', 'style'],
        })
        return () => observer.disconnect()
    }, [scroll, surface])

    useEffect(() => {
        if (autoFocus) focusableItems(listRef.current)[0]?.focus()
    }, [autoFocus])

    const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>): void => {
        const target = event.target as HTMLElement
        if (target.closest(LIST_SELECTOR) !== listRef.current) return
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        /* A control inside the list (a search field over the rows) keeps its own keys except that
         * ArrowDown/ArrowUp step into the rows: they are `tabIndex=-1` and Tab closes the menu, so
         * without this the rows cannot be reached from that field at all (WCAG 2.1.1). Home/End
         * stay with the field's caret. */
        if (isSingleLineTextInput(target)) {
            const items = focusableItems(listRef.current)
            const row =
                event.key === 'ArrowDown' ? items[0] : event.key === 'ArrowUp' ? items[items.length - 1] : undefined
            if (row) {
                event.preventDefault()
                row.focus()
            }
            return
        }
        const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End']
        if (!keys.includes(event.key) || !target.matches(ITEM_SELECTOR)) return
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
        onFocus: (event: FocusEvent<HTMLUListElement>): void => {
            const target = event.target as HTMLElement
            if (surface && target.matches(ITEM_SELECTOR)) setSurfaceTabStop(event.currentTarget, target)
        },
        className: cn(
            styles['list'],
            surface && styles['surface'],
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
