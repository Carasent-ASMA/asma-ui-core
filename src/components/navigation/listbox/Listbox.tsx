import { ClickAwayListener } from 'src/components/mui-compat'
import {
    Children,
    cloneElement,
    createContext,
    isValidElement,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react'
import { tabbableWithin } from 'src/helpers/focusable'

/**
 * @figmaNode none — **headless behaviour primitive**, no Design-System visuals. It renders bare
 * elements (`button`/`div[role=listbox]`/`div[role=option]`) that take a consumer `className`; all
 * styling (Menus surface, item states) is supplied by the caller via the aligned `StyledMenu`/tokens.
 * Nothing to align here — it carries no colours/dimensions of its own.
 *
 * Headless single-select `Listbox` compound (`Listbox` + `.Button`/`.Options`/`.Option`) — a
 * dependency-free replacement for the small `@headlessui/react` `Listbox` surface. Preserves the
 * render-prop API (`{ open }` / `{ selected }`), click selection, outside-click close (via
 * ClickAwayListener) and Escape-to-close. `.Options` renders nothing while closed, so no separate
 * transition wrapper is needed. Keyboard operation follows the APG combobox model: the trigger keeps
 * DOM focus and drives the open list through `aria-activedescendant`. Options may hold focusable
 * content of their own (the directory sidebar renders a search field in one), which stays reachable
 * by Tab — use `StyledSelect` for standard form selects.
 */

interface ListboxContextValue {
    open: boolean
    value: unknown
    listboxId: string
    activeIndex: number | null
    setOpen: (open: boolean) => void
    setActiveIndex: (index: number | null) => void
    select: (value: unknown) => void
}

const ListboxContext = createContext<ListboxContextValue | null>(null)

const useListboxContext = (): ListboxContextValue => {
    const ctx = useContext(ListboxContext)
    if (!ctx) throw new Error('Listbox.Button/Options/Option must be rendered inside <Listbox>')
    return ctx
}

type RenderProp<P> = ReactNode | ((state: P) => ReactNode)
const renderChildren = <P,>(children: RenderProp<P>, state: P): ReactNode =>
    typeof children === 'function' ? (children as (state: P) => ReactNode)(state) : children

function ListboxRoot<T>({
    value,
    onChange,
    children,
}: {
    value: T
    onChange: (value: T) => void
    children: ReactNode
}): JSX.Element {
    const [open, setOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const listboxId = `listbox-${useId()}`
    const rootRef = useRef<HTMLDivElement | null>(null)

    const close = useCallback((): void => {
        setOpen(false)
        setActiveIndex(null)
    }, [])

    // Escape is heard on the document rather than on the trigger, because focus is not necessarily
    // there: an option may hold a focusable control, and Escape has to dismiss from inside it too.
    // Focus then goes back to the trigger, or it would drop to <body> as the panel unmounts (2.4.3).
    useEffect(() => {
        if (!open) return
        const closeOnEscape = (event: KeyboardEvent): void => {
            if (event.key !== 'Escape') return
            const root = rootRef.current
            if (root?.contains(document.activeElement)) root.querySelector<HTMLElement>('[role="combobox"]')?.focus()
            close()
        }
        document.addEventListener('keydown', closeOnEscape)
        return () => document.removeEventListener('keydown', closeOnEscape)
    }, [open, close])

    const contextValue = useMemo<ListboxContextValue>(
        () => ({
            open,
            select: (next) => {
                onChange(next as T)
                close()
            },
            setOpen,
            setActiveIndex,
            activeIndex,
            listboxId,
            value,
        }),
        [open, value, onChange, activeIndex, listboxId, close],
    )

    return (
        <ListboxContext.Provider value={contextValue}>
            <ClickAwayListener onClickAway={close}>
                <div
                    ref={(node) => {
                        rootRef.current = node
                    }}
                    // Tab must not be trapped (2.1.2), but it must still be able to reach focusable
                    // content inside the panel — so the close is driven by focus actually leaving
                    // the widget, not by the keystroke. A null `relatedTarget` is the window losing
                    // focus, which is not a move away.
                    onBlur={(event) => {
                        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) close()
                    }}
                    className='relative w-full'
                >
                    {children}
                </div>
            </ClickAwayListener>
        </ListboxContext.Provider>
    )
}

const ListboxButton = ({
    children,
    className,
    onClick,
    onKeyDown,
    ...rest
}: {
    children: RenderProp<{ open: boolean }>
    className?: string
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>): JSX.Element => {
    const { activeIndex, listboxId, open, setActiveIndex, setOpen } = useListboxContext()
    const enabledOptions = (): HTMLElement[] =>
        Array.from(document.querySelectorAll<HTMLElement>(`#${CSS.escape(listboxId)} [role="option"]:not([aria-disabled="true"])`))
    const setActiveFrom = (direction: -1 | 1): void => {
        const options = enabledOptions()
        if (options.length === 0) return
        const current = options.findIndex((option) => option.id === `${listboxId}-option-${activeIndex}`)
        const next = current === -1 ? (direction === 1 ? 0 : options.length - 1) : Math.min(Math.max(current + direction, 0), options.length - 1)
        setActiveIndex(Number(options[next]!.dataset['index']))
    }
    const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            if (!open) {
                setOpen(true)
                requestAnimationFrame(() => setActiveFrom(event.key === 'ArrowDown' ? 1 : -1))
            } else setActiveFrom(event.key === 'ArrowDown' ? 1 : -1)
        } else if (open && (event.key === 'Home' || event.key === 'End')) {
            event.preventDefault()
            const options = enabledOptions()
            const option = options[event.key === 'Home' ? 0 : options.length - 1]
            // An all-disabled list has nothing to point at, and `aria-activedescendant` must never
            // name an element that does not exist (4.1.2).
            if (option) setActiveIndex(Number(option.dataset['index']))
        } else if (open && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault()
            enabledOptions().find((option) => option.id === `${listboxId}-option-${activeIndex}`)?.click()
        }
    }
    return (
        <button
            {...rest}
            type='button'
            className={className}
            onClick={(event) => {
                onClick?.(event)
                if (!event.defaultPrevented) setOpen(!open)
            }}
            onKeyDown={handleKeyDown}
            role='combobox'
            aria-haspopup='listbox'
            aria-expanded={open}
            aria-controls={open ? listboxId : undefined}
            aria-activedescendant={open && activeIndex !== null ? `${listboxId}-option-${activeIndex}` : undefined}
        >
            {renderChildren(children, { open })}
        </button>
    )
}

const ListboxOptions = ({ children, className }: { children: ReactNode; className?: string }): JSX.Element | null => {
    const { activeIndex, listboxId, open } = useListboxContext()

    // `aria-activedescendant` moves no DOM focus, so nothing brings the active row into view on its
    // own — same as `StyledSelect`, `StyledSelectAutocomplete` and `CountryCodeOptions`.
    useEffect(() => {
        if (activeIndex === null) return
        document.getElementById(`${listboxId}-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' })
    }, [activeIndex, listboxId])

    if (!open) return null
    return (
        <div id={listboxId} role='listbox' className={className}>
            {(() => {
                let optionIndex = 0
                return Children.toArray(children).map((child) =>
                    isValidElement(child) && child.type === ListboxOption
                        ? cloneElement(child, { optionIndex: optionIndex++ })
                        : child,
                )
            })()}
        </div>
    )
}

function ListboxOption<T>({
    value,
    disabled,
    children,
    className,
    optionIndex = 0,
}: {
    value: T
    disabled?: boolean
    children: RenderProp<{ selected: boolean }>
    className?: string
    optionIndex?: number
}): JSX.Element {
    const ctx = useListboxContext()
    const selected = ctx.value === value

    const choose = (): void => {
        if (!disabled) ctx.select(value)
    }

    return (
        // The trigger owns the keyboard: it keeps DOM focus and drives this row through
        // `aria-activedescendant`, so the row is `tabIndex={-1}` and deliberately has no key handler
        // of its own. Pointer selection still needs the click.
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <div
            id={`${ctx.listboxId}-option-${optionIndex}`}
            role='option'
            aria-selected={selected}
            aria-disabled={disabled}
            data-index={optionIndex}
            tabIndex={-1}
            className={className}
            onMouseDown={(event) => {
                // Clicking the row must not pull DOM focus off the trigger, which drives this row
                // through `aria-activedescendant`. A focusable control inside the row is the
                // exception — the directory sidebar renders its search field in one — so the
                // browser is left to focus that normally.
                const clicked = event.target as Node
                if (!tabbableWithin(event.currentTarget).some((control) => control.contains(clicked)))
                    event.preventDefault()
            }}
            onClick={choose}
        >
            {renderChildren(children, { selected })}
        </div>
    )
}

export const Listbox = Object.assign(ListboxRoot, {
    Button: ListboxButton,
    Option: ListboxOption,
    Options: ListboxOptions,
})
