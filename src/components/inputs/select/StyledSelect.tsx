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
    useRef,
    useState,
    type CSSProperties,
    type FocusEventHandler,
    type KeyboardEvent,
    type ReactElement,
    type ReactNode,
} from 'react'
import { ChevronDownIcon, CloseIcon } from 'src/components/icons'
import { cn } from 'src/helpers/cn'
import { HelperRow } from 'src/helpers/HelperRow'
import { resolveSx } from 'src/helpers/sx'
import { useHelperRowBudget } from 'src/helpers/useHelperRowBudget'
import { useHelperSlot } from 'src/helpers/useHelperSlot'
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
    const isStandard = variant === 'standard'
    const isError = error ?? ctx?.error ?? false
    const isDisabled = disabled ?? ctx?.disabled ?? false
    const message = isError ? (errorText ?? helperText) : helperText
    const { show: showHelperSlot, role: helperAlertRole } = useHelperSlot('StyledSelect', isError, message, reserveHelperText, readOnly)
    const helperId = useId()

    const { fieldRef, rowRef, rowStyle: helperRowStyle } = useHelperRowBudget(expandHelperText && showHelperSlot)

    const [open, setOpen] = useState(false)
    const [focused, setFocused] = useState(false)
    const [activeOptionIndex, setActiveOptionIndex] = useState<number | null>(null)
    const [uncontrolled, setUncontrolled] = useState(defaultValue)
    const isControlled = value !== undefined
    const currentValue = isControlled ? value : uncontrolled
    const hasValue = Array.isArray(currentValue)
        ? currentValue.length > 0
        : currentValue !== undefined && currentValue !== '' && currentValue !== null
    const childArray = Children.toArray(children)
    const isOptionSelected = (optionValue: unknown): boolean =>
        multiple ? Array.isArray(currentValue) && currentValue.includes(optionValue) : optionValue === currentValue
    const enabledOptionIndexes = childArray.flatMap((child, index) =>
        isValidElement<StyledSelectItemProps>(child) && !child.props.disabled ? [index] : [],
    )
    const selectedOptionIndex = childArray.findIndex(
        (child) => isValidElement<StyledSelectItemProps>(child) && isOptionSelected(child.props.value),
    )
    const getInitialActiveOptionIndex = (direction: -1 | 1 = 1): number | null => {
        if (enabledOptionIndexes.includes(selectedOptionIndex)) return selectedOptionIndex
        return enabledOptionIndexes[direction === 1 ? 0 : enabledOptionIndexes.length - 1] ?? null
    }
    const activeOptionId =
        activeOptionIndex === null ? undefined : `${listboxId}-option-${activeOptionIndex}`

    const listRef = useRef<HTMLUListElement>(null)

    // The trigger owns DOM focus throughout the open state; active options are exposed through
    // aria-activedescendant. Closing never needs to recover focus from a list item.
    const handleOpenChange = (next: boolean): void => {
        setOpen(next)
        if (!next) setActiveOptionIndex(null)
    }

    const {
        refs: { domReference, reference, setFloating, setReference },
        floatingStyles,
        context,
    } = useFloating({
        open,
        onOpenChange: handleOpenChange,
        placement: 'bottom-start',
        strategy: 'fixed',
        whileElementsMounted: autoUpdate,
        middleware: [
            // Figma Menus attaches flush to the field: in every cell of the Dynamic-select
            // reference (node 34523-166798) the Menus frame's top edge equals the input box's
            // bottom edge (Select 35046-160161: field h68 → Menus y68; Autocomplete 35046-161691:
            // same; multiple 34634-153389 h92 → y92). The 4px gap was a MUI-removal artefact
            // (ASMA-7573) — MUI's Popper/Autocomplete sat flush too. Keep the middleware at 0
            // rather than dropping it, so a flip to `top-start` also lands flush (ASMA-8080).
            offset(0),
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
    // Portal INTO the trigger's modal <dialog> (if any) so the listbox isn't inert. Popover API
    // only when body-portalled — nested showPopover inside a dialog breaks on mobile Safari.
    const [portalRoot, setPortalRoot] = useState<HTMLElement>()
    const usePopoverLayer = shouldUsePopoverTopLayer(portalRoot)
    const listboxRef = useMergeRefs([useTopLayerRef(setFloating, usePopoverLayer), listRef])

    // Report state into the surrounding FormControl so the label floats.
    useEffect(() => ctx?.setFocused(open || focused), [open, focused, ctx])
    useEffect(
        () => ctx?.setFilled(hasValue || Boolean(placeholder) || Boolean(displayEmpty)),
        [hasValue, placeholder, displayEmpty, ctx],
    )

    // Show the selected option on open, then follow keyboard navigation, without moving DOM focus.
    useEffect(() => {
        if (!open) return
        const id = requestAnimationFrame(() => {
            const option = activeOptionId
                ? document.getElementById(activeOptionId)
                : listRef.current?.querySelector<HTMLElement>('[role="option"][aria-selected="true"]')
            if (option && listRef.current?.contains(option)) option.scrollIntoView({ block: 'nearest' })
        })
        return () => cancelAnimationFrame(id)
    }, [activeOptionId, open])

    const selectValue = (next: unknown, child: ReactNode, close = !multiple): void => {
        const selected = multiple
            ? Array.isArray(currentValue) && currentValue.includes(next)
                ? currentValue.filter((item) => item !== next)
                : [...(Array.isArray(currentValue) ? (currentValue as unknown[]) : []), next]
            : next
        if (!isControlled) setUncontrolled(selected)
        onChange?.({ target: { value: selected, name } }, child)
        if (close) {
            handleOpenChange(false)
            requestAnimationFrame(() => (domReference.current as HTMLElement | null)?.focus())
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
        handleOpenChange(false)
        setFocused(false)
    }

    const options = Children.map(children, (child, index) => {
        if (!isValidElement<StyledSelectItemProps>(child)) return child
        const itemValue = child.props.value
        return cloneElement(child, {
            id: `${listboxId}-option-${index}`,
            active: index === activeOptionIndex,
            selected: isOptionSelected(itemValue),
            onClick: () => {
                // Pointer selection is not keyboard navigation. In particular, a multiple Select
                // remains open after a click, so don't leave its keyboard-active indicator behind.
                setActiveOptionIndex(null)
                selectValue(itemValue, child.props.children)
            },
        })
    })

    // The selected option's label drives the trigger display (unless renderValue overrides).
    const selectedChild = childArray.find(
        (child): child is ReactElement<StyledSelectItemProps> =>
            isValidElement<StyledSelectItemProps>(child) && child.props.value === currentValue,
    )
    const shownValue = renderValue
        ? renderValue(currentValue)
        : multiple && Array.isArray(currentValue)
          ? childArray
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

    const moveActiveOption = (direction: -1 | 1): void => {
        if (enabledOptionIndexes.length === 0) return
        setActiveOptionIndex((previousIndex) => {
            const position = enabledOptionIndexes.indexOf(previousIndex ?? selectedOptionIndex ?? -1)
            if (position === -1) return enabledOptionIndexes[direction === 1 ? 0 : enabledOptionIndexes.length - 1] ?? null
            const nextPosition = Math.min(Math.max(position + direction, 0), enabledOptionIndexes.length - 1)
            return enabledOptionIndexes[nextPosition] ?? null
        })
    }

    const selectActiveOption = (closeAfterSelect: boolean): void => {
        const activeOption = activeOptionIndex === null ? undefined : childArray[activeOptionIndex]
        if (!isValidElement<StyledSelectItemProps>(activeOption) || activeOption.props.disabled) return
        selectValue(activeOption.props.value, activeOption.props.children, closeAfterSelect)
    }

    const openList = (direction: -1 | 1 = 1): void => {
        setPortalRoot(getOpenModalDialogAncestor(reference.current))
        setActiveOptionIndex(getInitialActiveOptionIndex(direction))
        setOpen(true)
    }

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
        if (isDisabled || readOnly) return

        if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            event.preventDefault()
            openList(event.key === 'ArrowDown' ? 1 : -1)
            return
        }
        if (!open) return

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            moveActiveOption(event.key === 'ArrowDown' ? 1 : -1)
        } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault()
            setActiveOptionIndex(enabledOptionIndexes[event.key === 'Home' ? 0 : enabledOptionIndexes.length - 1] ?? null)
        } else if (event.key === ' ') {
            event.preventDefault()
            selectActiveOption(false)
        } else if (event.key === 'Enter') {
            event.preventDefault()
            selectActiveOption(true)
        } else if (event.key === 'Escape') {
            event.preventDefault()
            handleOpenChange(false)
        } else if (event.key === 'Tab') {
            handleOpenChange(false)
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
                ref={setReference}
                type='button'
                data-testid={dataTest}
                // `getReferenceProps()` (from `useRole(context, { role: 'listbox' })`) sets its own
                // role/aria-haspopup/aria-expanded on the reference — spread it FIRST so our explicit,
                // single-source-of-truth attributes below (bound to local `open`/`listboxId`) win instead
                // of being silently shadowed by floating-ui's copy (JSX: later props override earlier).
                {...getReferenceProps({
                    onClick: () => setPortalRoot(getOpenModalDialogAncestor(reference.current)),
                    onKeyDown: handleTriggerKeyDown,
                })}
                role='combobox'
                aria-haspopup='listbox'
                aria-expanded={open}
                aria-controls={listboxId}
                aria-activedescendant={open ? activeOptionId : undefined}
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
                        // Floating UI's generated id must not replace `listboxId`: the trigger's
                        // aria-controls points to this exact stable id.
                        {...getFloatingProps()}
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
                        className={cn(
                            // Figma Menus (node 34522-151497): the list is padded `8px 0` (was 4px)
                            // and separates its rows from the container — see the equivalent rule on
                            // StyledSelectAutocomplete's listbox for why it does not live on the row.
                            'z-[1300] m-0 max-h-72 list-none overflow-auto rounded border border-solid border-delta-300 bg-white px-0 py-2 shadow-[0px_2px_4px_0px_rgba(34,33,51,0.15)]',
                            '[&>li:not(:last-child)]:border-0 [&>li:not(:last-child)]:border-b',
                            '[&>li:not(:last-child)]:border-solid [&>li:not(:last-child)]:border-delta-200',
                            MenuProps?.className,
                        )}
                    >
                        {options}
                    </ul>
                </FloatingPortal>
            )}

            {showHelperSlot && (
                <HelperRow
                    ref={rowRef}
                    id={helperId}
                    role={helperAlertRole}
                    error={isError}
                    message={message}
                    className='m-0 mr-[14px] box-border items-center'
                    style={helperRowStyle}
                />
            )}
        </div>
    )
}
