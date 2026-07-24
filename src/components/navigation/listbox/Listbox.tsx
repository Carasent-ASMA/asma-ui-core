import { ClickAwayListener } from 'src/components/mui-compat'
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react'

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
 * transition wrapper is needed. Arrow-key option navigation is intentionally not implemented — this
 * is a search-and-click dropdown primitive; use `StyledSelect` for standard form selects.
 */

interface ListboxContextValue {
    open: boolean
    value: unknown
    setOpen: (open: boolean) => void
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

    const contextValue = useMemo<ListboxContextValue>(
        () => ({
            open,
            select: (next) => {
                onChange(next as T)
                setOpen(false)
            },
            setOpen,
            value,
        }),
        [open, value, onChange],
    )

    useEffect(() => {
        if (!open) return
        const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') setOpen(false)
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [open])

    return (
        <ListboxContext.Provider value={contextValue}>
            <ClickAwayListener onClickAway={() => setOpen(false)}>
                <div className='relative w-full'>{children}</div>
            </ClickAwayListener>
        </ListboxContext.Provider>
    )
}

const ListboxButton = ({
    children,
    className,
    ...rest
}: {
    children: RenderProp<{ open: boolean }>
    className?: string
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>): JSX.Element => {
    const { open, setOpen } = useListboxContext()
    return (
        <button type='button' className={className} onClick={() => setOpen(!open)} {...rest}>
            {renderChildren(children, { open })}
        </button>
    )
}

const ListboxOptions = ({ children, className }: { children: ReactNode; className?: string }): JSX.Element | null => {
    const { open } = useListboxContext()
    if (!open) return null
    return (
        <div role='listbox' className={className}>
            {children}
        </div>
    )
}

function ListboxOption<T>({
    value,
    disabled,
    children,
    className,
}: {
    value: T
    disabled?: boolean
    children: RenderProp<{ selected: boolean }>
    className?: string
}): JSX.Element {
    const ctx = useListboxContext()
    const selected = ctx.value === value

    const choose = (): void => {
        if (!disabled) ctx.select(value)
    }

    return (
        // False positive: the rule can't statically prove the ternary always yields a number, but
        // conditionally removing a disabled option from the tab order (vs a constant tabIndex=0) is
        // the correct ARIA pattern here.
        // eslint-disable-next-line jsx-a11y/interactive-supports-focus
        <div
            role='option'
            aria-selected={selected}
            aria-disabled={disabled}
            tabIndex={disabled ? undefined : 0}
            className={className}
            onClick={choose}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    choose()
                }
            }}
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
