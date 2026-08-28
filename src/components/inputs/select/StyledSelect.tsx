import {
    autoUpdate,
    flip,
    FloatingPortal,
    offset,
    shift,
    size as sizeMiddleware,
    useClick,
    useDismiss,
    useFloating,
    useInteractions,
    useMergeRefs,
    useRole,
} from '@floating-ui/react'
import {
    Children,
    cloneElement,
    isValidElement,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type FocusEventHandler,
    type KeyboardEvent,
    type ReactElement,
    type ReactNode,
} from 'react'
import { ChevronDownIcon, CloseIcon, ErrorOutlineIcon } from 'src/components/icons'
import { cn } from 'src/helpers/cn'
import { resolveSx } from 'src/helpers/sx'
import { useHelperAlertRole } from 'src/helpers/useHelperAlertRole'
import { useHelperRowBudget } from 'src/helpers/useHelperRowBudget'
import { warnMissingErrorMessage } from 'src/helpers/warnMissingErrorMessage'
import {
    getOpenModalDialogAncestor,
    shouldUsePopoverTopLayer,
    TOP_LAYER_PROPS,
    TOP_LAYER_RESET_STYLE,
    useTopLayerRef,
} from 'src/hooks/useTopLayer.hook'
import { useFormControlContext } from '../../miscellaneous/FormControlContext'
import { outlineClass, type FieldSize } from '../field-styles'
import type { StyledSelectItemProps } from './StyledSelectItem'

export interface SelectChangeEvent<T = unknown> {
    target: { value: T; name?: string }
}

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#15561-37391
 * The trigger is the outlined **Input field** (shared `field-styles`: 40px, focus gama-400, hover
 * gama-300); the dropdown is **Menus** (node 16073-19226). Figma field **State** (Enabled/Hovered/
 * Focused/Error/Disabled/Read-only) ← open/focus + `error`/`disabled`/`readOnly`; **Filled** ← `value`.
 */
export interface StyledSelectProps {
    /** @figmaProp none — test hook */
    dataTest: string
    /** @figmaProp Filled + trigger display value */
    value?: unknown
    /** @figmaProp Filled (initial, uncontrolled) */
    defaultValue?: unknown
    onChange?: (event: SelectChangeEvent, child: ReactNode) => void
    /**
     * rendering**: the trigger value is Body Base 16px and the field is 40px at every size (a smaller
     * size only changed text before; Figma field text is 16/lh24 regardless). Kept so `size="small"`
     * call sites still compile. Ignored on purpose (not destructured).
     */
    size?: FieldSize
    /** @figmaProp State = true→"Error" */
    error?: boolean
    errorText?: string
    helperText?: ReactNode
    reserveHelperText?: boolean
    expandHelperText?: boolean
    /** @figmaProp Clear (trigger clear button) */
    allowClear?: boolean
    /** @figmaProp State = true→"Disabled" */
    disabled?: boolean
    /** @figmaProp State = true→"Read-only" */
    readOnly?: boolean
    name?: string
    /** @figmaProp Placeholder text (resting) */
    placeholder?: string
    displayEmpty?: boolean
    multiple?: boolean
    renderValue?: (value: unknown) => ReactNode
    fullWidth?: boolean
    className?: string
    style?: CSSProperties
    /** Accepted for API parity; `standard` renders borderless (calendar month/year dropdowns).
     * `string & {}` keeps 'outlined'/'standard' as autocomplete hints without TS treating them as
     * redundant against the `string` fallback (other MUI variant values are accepted and ignored). */
    variant?: 'outlined' | 'standard' | (string & {})
    sx?: unknown
    /** Sets `aria-labelledby` on the trigger — the field's real accessible-name source when a
     * visible label sits outside the control (MUI `Select` parity; genuinely wired, unlike `size`
     * above). Without it (and no `name`/placeholder/value text), the trigger has no accessible name
     * at all — a common gap when a floating/external label isn't referenced. */
    labelId?: string
    children?: ReactNode
    MenuProps?: { className?: string }
    /** Forwarded to the trigger button, merged with the internal focus tracking (e.g. validate on blur). */
    onFocus?: FocusEventHandler<HTMLButtonElement>
    onBlur?: FocusEventHandler<HTMLButtonElement>
}

/**
 * Single-select dropdown (replaces MUI `Select`) — a trigger styled as the outlined field plus a
 * portalled `role="listbox"`. Reports open/filled into a surrounding `StyledFormControl` so its
 * TASK-402.
 */
export const StyledSelect = ({
    dataTest,
    value,
    defaultValue,
    onChange,
    error,
    errorText,
    helperText,
    reserveHelperText,
    expandHelperText = true,
    allowClear,
    disabled,
    readOnly,
    name,
    placeholder,
    displayEmpty,
    multiple,
    renderValue,
    fullWidth,
    className,
    style,
    sx,
    variant,
    children,
    MenuProps,
    onFocus,
    onBlur,
    labelId,
}: StyledSelectProps): JSX.Element => {
    const ctx = useFormControlContext()
    const listboxId = `${dataTest}-listbox`
    const helperId = useId()
    const isStandard = variant === 'standard'
    const isError = error ?? ctx?.error ?? false
    const isDisabled = disabled ?? ctx?.disabled ?? false
    const message = isError ? (errorText ?? helperText) : helperText
    const showHelperSlot = !readOnly && (reserveHelperText === true || message != null || isError)
    warnMissingErrorMessage('StyledSelect', isError, message)
    const helperAlertRole = useHelperAlertRole(isError)

    const { fieldRef, rowRef, rowStyle: helperRowStyle } = useHelperRowBudget(expandHelperText && showHelperSlot)

    const [open, setOpen] = useState(false)
    const [focused, setFocused] = useState(false)
    const [uncontrolled, setUncontrolled] = useState(defaultValue)
    const isControlled = value !== undefined
    const currentValue = isControlled ? value : uncontrolled
    const hasValue = Array.isArray(currentValue)
        ? currentValue.length > 0
        : currentValue !== undefined && currentValue !== '' && currentValue !== null

    const listRef = useRef<HTMLUListElement>(null)
    // Own handle on the trigger element: the merged floating-ui ref below can't be read back, and the
    // dismiss handler needs to hand focus to it.
    const triggerElRef = useRef<HTMLButtonElement | null>(null)

    // Every close except a selection unmounts the listbox while the open-effect below still holds DOM
    // focus inside it, so focus would fall to <body> and the next Tab would restart from the top of
    // the document (WCAG 2.4.3 / 2.4.7; the ARIA combobox pattern requires Escape to return focus to
    // the trigger). `selectValue` already restores focus after a pick — this covers Escape, outside
    // press and re-clicking the trigger. Focus the user has already moved elsewhere is left alone.
    const handleOpenChange = (next: boolean): void => {
        setOpen(next)
        if (next) return
        const active = document.activeElement
        if (active && active !== document.body && !listRef.current?.contains(active)) return
        triggerElRef.current?.focus()
    }

    const { refs, floatingStyles, context } = useFloating({
        open,
        onOpenChange: handleOpenChange,
        placement: 'bottom-start',
        strategy: 'fixed',
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(4),
            flip({ padding: 8 }),
            shift({ padding: 8 }),
            sizeMiddleware({
                apply({ rects, elements }) {
                    elements.floating.style.minWidth = `${rects.reference.width + 20}px`
                },
            }),
        ],
    })
    const click = useClick(context, { enabled: !isDisabled && !readOnly })
    const dismiss = useDismiss(context)
    const role = useRole(context, { role: 'listbox' })
    const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role])
    const triggerRef = useMergeRefs([refs.setReference, triggerElRef])
    // Portal INTO the trigger's modal <dialog> (if any) so the listbox isn't inert. Popover API
    // only when body-portalled — nested showPopover inside a dialog breaks on mobile Safari.
    const portalRoot = useMemo(
        () => (open ? getOpenModalDialogAncestor(refs.reference.current) : undefined),
        [open, refs],
    )
    const usePopoverLayer = shouldUsePopoverTopLayer(portalRoot)
    const listboxRef = useMergeRefs([useTopLayerRef(refs.setFloating, usePopoverLayer), listRef])

    // Report state into the surrounding FormControl so the label floats.
    useEffect(() => ctx?.setFocused(open || focused), [open, focused, ctx])
    useEffect(
        () => ctx?.setFilled(hasValue || Boolean(placeholder) || Boolean(displayEmpty)),
        [hasValue, placeholder, displayEmpty, ctx],
    )

    // Scroll (and focus) the selected option into view when the listbox opens — long year/month
    // menus otherwise open at the top while the current value sits off-screen.
    useEffect(() => {
        if (!open) return
        const id = requestAnimationFrame(() => {
            const selected = listRef.current?.querySelector<HTMLElement>('[role="option"][aria-selected="true"]')
            if (!selected) return
            selected.scrollIntoView({ block: 'nearest' })
            selected.focus()
        })
        return () => cancelAnimationFrame(id)
    }, [open])

    const selectValue = (next: unknown, child: ReactNode): void => {
        const selected = multiple
            ? Array.isArray(currentValue) && currentValue.includes(next)
                ? currentValue.filter((item) => item !== next)
                : [...(Array.isArray(currentValue) ? (currentValue as unknown[]) : []), next]
            : next
        if (!isControlled) setUncontrolled(selected)
        onChange?.({ target: { value: selected, name } }, child)
        if (!multiple) {
            setOpen(false)
            requestAnimationFrame(() => (refs.domReference.current as HTMLElement | null)?.focus())
        }
    }

    // Shared by the mouse-only clear icon (below) and the Backspace/Delete keyboard equivalent on the
    // trigger — the icon is `aria-hidden` (it's nested inside the trigger <button>, so it can't be an
    // independent, valid Tab stop), so the keyboard path must reach the same logic another way (WCAG 2.1.1
    // requires the FUNCTION be keyboard-operable, not literally the same element be focusable).
    const handleClear = (): void => {
        const cleared = multiple ? [] : ''
        if (!isControlled) setUncontrolled(cleared)
        onChange?.({ target: { value: cleared, name } }, null)
        setOpen(false)
        setFocused(false)
    }

    const options = Children.map(children, (child) => {
        if (!isValidElement<StyledSelectItemProps>(child)) return child
        const itemValue = child.props.value
        return cloneElement(child, {
            selected: multiple
                ? Array.isArray(currentValue) && currentValue.includes(itemValue)
                : itemValue === currentValue,
            onClick: () => selectValue(itemValue, child.props.children),
        })
    })

    // The selected option's label drives the trigger display (unless renderValue overrides).
    const selectedChild = Children.toArray(children).find(
        (child): child is ReactElement<StyledSelectItemProps> =>
            isValidElement<StyledSelectItemProps>(child) && child.props.value === currentValue,
    )
    const shownValue = renderValue
        ? renderValue(currentValue)
        : multiple && Array.isArray(currentValue)
          ? Children.toArray(children)
                .filter(
                    (child): child is ReactElement<StyledSelectItemProps> =>
                        isValidElement<StyledSelectItemProps>(child) && currentValue.includes(child.props.value),
                )
                // Option labels are normally string/number; a richer ReactNode (icon + text) has no
                // sensible string form for the trigger, so it contributes nothing rather than
                // "[object Object]".
                .map((child) => {
                    const label = child.props.children
                    return typeof label === 'string' || typeof label === 'number' ? String(label) : ''
                })
                .join(', ')
          : selectedChild?.props.children

    const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
        if (
            (event.key === 'Backspace' || event.key === 'Delete') &&
            allowClear &&
            hasValue &&
            !isDisabled &&
            !readOnly
        ) {
            event.preventDefault()
            handleClear()
            return
        }
        if ((event.key !== 'ArrowDown' && event.key !== 'ArrowUp') || isDisabled || readOnly) return
        event.preventDefault()
        setOpen(true)
        // Focus falls to the selected option via the open-effect above; if none selected, land on
        // first (ArrowDown) / last (ArrowUp) so keyboard open still has a focus target.
        requestAnimationFrame(() => {
            if (listRef.current?.querySelector('[role="option"][aria-selected="true"]')) return
            const items = listRef.current?.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])')
            if (!items?.length) return
            items[event.key === 'ArrowUp' ? items.length - 1 : 0]?.focus()
        })
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>): void => {
        const items = listRef.current
            ? Array.from(listRef.current.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])'))
            : []
        if (items.length === 0) return
        const activeIndex = items.findIndex((n) => n === document.activeElement)
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            const delta = event.key === 'ArrowDown' ? 1 : -1
            items[(activeIndex + delta + items.length) % items.length]?.focus()
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            ;(document.activeElement as HTMLElement | null)?.click()
        }
    }

    // `standard` reads as a button (calendar month/year), so its focused/open state mirrors
    // StyledButton's: gama-50 fill + gama-500 label on top of the gama-400 ring. Each colour is an
    // exclusive branch rather than a stacked override — Tailwind runs with `important: true`, so two
    // colour utilities on one element are resolved by stylesheet order, not by JSX order.
    const isButtonFocus = isStandard && (open || focused)
    const triggerTextClass = isDisabled ? 'text-delta-300' : isButtonFocus ? 'text-gama-500' : 'text-delta-800'
    const chevronRestingClass = isDisabled ? 'text-delta-300' : 'text-delta-700'

    return (
        <div
            ref={fieldRef}
            className={cn('group relative inline-flex flex-col', fullWidth && 'w-full', className)}
            style={{ fontFamily: 'Roboto, Helvetica, Arial, sans-serif', ...resolveSx(sx), ...style }}
        >
            <button
                ref={triggerRef}
                type='button'
                data-testid={dataTest}
                // `getReferenceProps()` (from `useRole(context, { role: 'listbox' })`) sets its own
                // role/aria-haspopup/aria-expanded on the reference — spread it FIRST so our explicit,
                // single-source-of-truth attributes below (bound to local `open`/`listboxId`) win instead
                // of being silently shadowed by floating-ui's copy (JSX: later props override earlier).
                // getReferenceProps merely MERGES this handler into the returned props object (standard
                // @floating-ui/react usage, called during render by design) — it doesn't read a ref's
                // `.current` synchronously, so this isn't the unsafe pattern the rule targets.
                // eslint-disable-next-line react-hooks/refs
                {...getReferenceProps({ onKeyDown: handleTriggerKeyDown })}
                role='combobox'
                aria-haspopup='listbox'
                aria-expanded={open}
                aria-controls={listboxId}
                // `labelId` (external label) wins when present — same MUI `Select` intent as
                // `aria-labelledby` taking precedence over `aria-label` per spec. Otherwise fall back
                // to `name` (unconditionally, same as the listbox's own `aria-label={name}` below) so
                // the trigger has a real name instead of relying entirely on whatever placeholder/
                // value text happens to be visible — which is either absent (nameless trigger, the
                // axe `button-name` bug) or, when present, an ambiguous name on its own (a screen
                // reader announcing just the selected value, e.g. "Paused", doesn't say what the field is).
                aria-labelledby={labelId}
                aria-label={!labelId ? name : undefined}
                aria-invalid={isError ? true : undefined}
                aria-describedby={showHelperSlot ? helperId : undefined}
                aria-disabled={isDisabled ? true : undefined}
                disabled={isDisabled}
                onFocus={(event) => {
                    setFocused(true)
                    onFocus?.(event)
                }}
                onBlur={(event) => {
                    setFocused(false)
                    onBlur?.(event)
                }}
                style={{ minWidth: hasValue && !isStandard ? 105 : undefined }}
                className={cn(
                    'relative flex w-full items-center justify-between text-left outline-none',
                    // Figma field text = Body Base 16/lh24 (`text-base`), h40 (matches StyledInputField/field-styles).
                    // `standard` shares the outlined geometry (h40, px-3, radius) — only its border is
                    // deferred to focus, via `borderless` on the outline overlay below.
                    'h-10 rounded-lg border-0 px-3 text-base transition-colors',
                    isButtonFocus ? 'bg-gama-50' : 'bg-transparent',
                    triggerTextClass,
                    isStandard && 'min-w-0',
                    isDisabled && 'cursor-not-allowed',
                    readOnly && 'pointer-events-none',
                )}
            >
                <span className={cn('min-w-0 flex-1 truncate', !hasValue && 'text-delta-500')}>
                    {hasValue || displayEmpty ? shownValue : placeholder}
                </span>
                <span className='flex items-center gap-1'>
                    {allowClear && hasValue && !isDisabled && (
                        // Mouse-only affordance, nested inside the trigger <button> — it can't be a
                        // second, independently focusable control without invalid nested-interactive
                        // semantics (a <button> may not contain interactive content). No `role='button'`
                        // and `aria-hidden`: don't claim a Tab stop that isn't actually reachable. The
                        // keyboard-equivalent path is Backspace/Delete on the trigger (handleTriggerKeyDown).
                        <span
                            aria-hidden='true'
                            data-testid='select-clear-button'
                            className='flex items-center justify-center rounded-full p-[2px] hover:bg-gama-100'
                            onClick={(event) => {
                                event.stopPropagation()
                                handleClear()
                            }}
                        >
                            <CloseIcon width={18} height={18} />
                        </span>
                    )}
                    <ChevronDownIcon
                        width={24}
                        height={24}
                        className={cn(
                            'shrink-0 transition-transform',
                            isButtonFocus ? 'text-gama-500' : chevronRestingClass,
                            open && 'rotate-180',
                        )}
                    />
                </span>
                <div
                    className={outlineClass({
                        focused: open || focused,
                        error: isError,
                        disabled: isDisabled,
                        readOnly,
                        borderless: isStandard,
                    })}
                />
            </button>

            {open && (
                <FloatingPortal root={portalRoot}>
                    <ul
                        ref={listboxRef}
                        id={listboxId}
                        role='listbox'
                        // Mirror the trigger's own name fallback (`labelId` wins, else `name`) — the
                        // popup is a separate element from the trigger and needs its own accessible name
                        // (axe `aria-input-field-name`); relying on `name` alone left it nameless for any
                        // consumer using only an external `labelId` label, which is the common case.
                        aria-labelledby={labelId}
                        aria-label={!labelId ? name : undefined}
                        {...(usePopoverLayer ? TOP_LAYER_PROPS : {})}
                        style={{
                            ...(usePopoverLayer ? TOP_LAYER_RESET_STYLE : {}),
                            ...floatingStyles,
                            fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
                        }}
                        {...getFloatingProps()}
                        onKeyDown={handleKeyDown}
                        className={cn(
                            'z-[1300] m-0 max-h-72 list-none overflow-auto rounded-lg border border-solid border-delta-300 bg-white px-0 py-1 shadow-[0px_2px_4px_0px_rgba(34,33,51,0.15)]',
                            MenuProps?.className,
                        )}
                    >
                        {options}
                    </ul>
                </FloatingPortal>
            )}

            {showHelperSlot && (
                <div
                    ref={rowRef}
                    id={helperId}
                    role={helperAlertRole}
                    className={cn(
                        'm-0 mr-[14px] box-border flex min-h-[24px] items-center gap-1 pt-1 text-sm leading-5 tracking-[0.03333em]',
                        isError ? 'text-error-500' : 'text-delta-600',
                    )}
                    style={helperRowStyle}
                >
                    {isError && <ErrorOutlineIcon width={20} height={20} className='min-w-5 shrink-0' />}
                    <span>{message}</span>
                </div>
            )}
        </div>
    )
}
