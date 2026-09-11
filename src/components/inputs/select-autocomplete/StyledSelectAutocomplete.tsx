import {
    autoUpdate,
    flip,
    FloatingPortal,
    offset,
    shift,
    size as sizeMiddleware,
    useDismiss,
    useFloating,
    useInteractions,
    useMergeRefs,
    useRole,
} from '@floating-ui/react'
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type HTMLAttributes,
    type KeyboardEvent,
    type ReactNode,
    type SyntheticEvent,
} from 'react'
import { StyledChip } from 'src/components/data-display/chip'
import { CheckIcon, ChevronDownIcon, CloseIcon, PlusIconCircle } from 'src/components/icons'
import { StyledCheckbox } from 'src/components/inputs/checkbox/base-ui/StyledCheckbox'
import { cn } from 'src/helpers/cn'
import {
    getOpenModalDialogAncestor,
    shouldUsePopoverTopLayer,
    TOP_LAYER_PROPS,
    TOP_LAYER_RESET_STYLE,
    useTopLayerRef,
} from 'src/hooks/useTopLayer.hook'
import { LoadingIcon } from 'src/table/shared-components/LoadingIcon'
import style from './StyledSelectAutocomplete.module.scss'

export type AutocompleteChangeReason = 'createOption' | 'selectOption' | 'removeOption' | 'clear' | 'blur'
export type AutocompleteInputChangeReason = 'input' | 'reset' | 'clear'

export interface AutocompleteRenderOptionState {
    selected: boolean
    index: number
    inputValue: string
}

/** Props the combobox hands to `renderInput`; spread straight onto `StyledInputField`. */
export interface AutocompleteRenderInputParams {
    disabled?: boolean
    size?: 'small' | 'medium'
    fullWidth?: boolean
    error?: boolean
    helperText?: ReactNode
    value: string
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    onFocus?: () => void
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
    slotProps: {
        htmlInput: Record<string, unknown> & { ref?: React.Ref<HTMLInputElement> }
        input: { ref: React.Ref<HTMLDivElement>; startAdornment?: ReactNode; endAdornment?: ReactNode }
    }
}

type OptionLiProps = HTMLAttributes<HTMLLIElement> & {
    key?: string
    ref?: React.Ref<HTMLLIElement>
    [dataAttr: `data-${string}`]: unknown
}

type SingleValue<T> = T | null
type MultiValue<T> = T[]

// Value shape mirrors MUI Autocomplete's generic resolution (used to keep the generic params live).
type AutocompleteValue<T, Multiple, DisableClearable, FreeSolo> = Multiple extends true
    ? MultiValue<T>
    : FreeSolo extends true
      ? T | string | null
      : DisableClearable extends true
        ? T
        : SingleValue<T>

// The generic signature (T, Multiple, DisableClearable, FreeSolo) is preserved for call-site
// compatibility; the runtime only branches on `multiple`.
/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#20474-29075
 * Figma "Autocomplete". The trigger is the outlined **Input field** (shared `field-styles`: 40px,
 * border enabled delta-500/`#7a899e`, hover gama-300, focus gama-400 `#1ca1a1`, error error-500),
 * so the field **State** (Enabled/Hovered/Focused/Error/Read-only) ← focus/open + `error`/`readOnly`/
 * `disabled`. **Filled** ← selected value(s): single fills the input text, multiple renders **Tag
 * chips** (`StyledChip`: h32, radius25, label 16/delta-700 — node 20475-29954). The dropdown is the
 * **Menus** surface (node 16073-19226): radius 4 (Figma `menus` token), border delta-300, Menus shadow. Popup indicator =
 * `+` (`PlusIconCircle`, multiple) or chevron (single); clear = `CloseIcon`. Non-annotated props are
 */
export interface StyledSelectAutocompleteProps<
    T,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
    FreeSolo extends boolean | undefined = false,
> {
    /** @figmaProp none — test hook */
    dataTest: string
    /** @figmaProp options → dropdown list rows (Menus items / Recipient list items) */
    options: readonly T[]
    /** @figmaProp none — renders the Figma "Input field" trigger (field State/Filled live here) */
    renderInput: (params: AutocompleteRenderInputParams) => ReactNode
    // Input value is a loose union (the runtime accepts any shape); onChange stays precise via the
    // conditional AutocompleteValue, which also keeps the Multiple/DisableClearable/FreeSolo generics live.
    /** @figmaProp Filled — single: input text; multiple: Tag chips (StyledChip) */
    value?: SingleValue<T> | MultiValue<T> | string | undefined
    defaultValue?: SingleValue<T> | MultiValue<T> | string | undefined
    onChange?: (
        event: SyntheticEvent,
        value: AutocompleteValue<T, Multiple, DisableClearable, FreeSolo>,
        reason: AutocompleteChangeReason,
        details?: { option: T },
    ) => void
    getOptionLabel?: (option: T) => string
    /** Stable React key per option, independent of the label — required when labels can collide. */
    getOptionKey?: (option: T) => string | number
    isOptionEqualToValue?: (option: T, value: T) => boolean
    renderOption?: (props: OptionLiProps, option: T, state: AutocompleteRenderOptionState) => ReactNode
    renderValue?: (value: MultiValue<T>, getItemProps: (opts: { index: number }) => OptionLiProps) => ReactNode
    filterOptions?: (options: T[], state: { inputValue: string }) => T[]
    groupBy?: (option: T) => string
    loading?: boolean
    loadingText?: ReactNode
    noOptionsText?: ReactNode
    /** @figmaProp State = true→"Disabled" */
    disabled?: boolean
    /** @figmaProp State = true→"Read-only" (chips lose their delete button; no popup/clear icons) */
    readOnly?: boolean
    error?: boolean
    helperText?: ReactNode
    /** @figmaProp none — FieldSize (both render the 40px field) */
    size?: 'small' | 'medium'
    /** @figmaProp Clear (trigger clear button) */
    disableClearable?: boolean
    freeSolo?: boolean
    open?: boolean
    onOpen?: (event?: SyntheticEvent) => void
    onClose?: (event?: SyntheticEvent, reason?: string) => void
    disableCloseOnSelect?: boolean
    inputValue?: string
    onInputChange?: (event: SyntheticEvent | null, value: string, reason: AutocompleteInputChangeReason) => void
    /** @figmaProp popup indicator — defaults to `+` (PlusIconCircle) when multiple, else chevron */
    popupIcon?: ReactNode
    autoHeight?: boolean
    /** @figmaProp Filled shape — true renders Tag chips + `+` indicator (Figma "multiple select") */
    multiple?: Multiple
    allowSelectAll?: boolean
    selectAllLabel?: string
    fullWidth?: boolean
    /** Accepted for MUI parity; single-select already omits selected options via filtering. */
    filterSelectedOptions?: boolean
    getOptionDisabled?: (option: T) => boolean
    classes?: { root?: string; paper?: string; listbox?: string }
    className?: string
    wrapperClassName?: string
    /** Style/class the portalled listbox (MUI `slotProps.popper` parity); e.g. raise its z-index above an overlay. */
    slotProps?: { popper?: { className?: string; style?: CSSProperties } }
    sx?: unknown
}

const objectLabel = <T,>(option: T): string => {
    if (typeof option === 'object' && option !== null && 'label' in option) return String((option as { label: unknown }).label)
    return String(option)
}
const isOptionObjectDisabled = <T,>(option: T): boolean =>
    typeof option === 'object' && option !== null && 'disabled' in option && Boolean((option as { disabled?: unknown }).disabled)

/**
 * single + multiple selection (with tag chips + optional select-all), type-ahead filtering,
 * async `loading`, grouping, and the MUI `renderInput`/`renderOption`/`renderValue` callback
 *
 * ponytail: `freeSolo` is accepted (arbitrary input is emitted via onInputChange) but not turned
 * into option values; exact keyboard-parity edge cases are Chromatic/axe-gated.
 */
export function StyledSelectAutocomplete<
    T,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
    FreeSolo extends boolean | undefined = false,
>({
    dataTest,
    options,
    renderInput,
    value,
    onChange,
    getOptionLabel,
    getOptionKey,
    isOptionEqualToValue,
    renderOption,
    renderValue,
    filterOptions,
    loading,
    loadingText = 'Loading…',
    noOptionsText = 'No options',
    disabled,
    readOnly,
    error,
    helperText,
    size = 'small',
    disableClearable,
    disableCloseOnSelect,
    popupIcon,
    autoHeight,
    multiple,
    allowSelectAll,
    selectAllLabel = 'Select all',
    fullWidth,
    classes,
    inputValue: controlledInput,
    onInputChange,
    open: controlledOpen,
    onOpen,
    onClose,
    className,
    wrapperClassName,
    getOptionDisabled,
    slotProps,
}: StyledSelectAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>): JSX.Element {
    const isMultiple = multiple === true
    const getLabel = getOptionLabel ?? objectLabel
    const isEqual = (a: T, b: T): boolean => (isOptionEqualToValue ? isOptionEqualToValue(a, b) : a === b)

    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
    const open = controlledOpen ?? uncontrolledOpen
    const setOpen = (next: boolean): void => {
        // Read-only / disabled fields are display-only: no path (click, keyboard, icon, typing) may
        // open the popup. Closing is always allowed. Gating here is the single root cause — the input's
        // onClick and ArrowDown handler both call setOpen(true) and previously ignored readOnly.
        if (next && (readOnly || disabled)) return
        if (controlledOpen === undefined) setUncontrolledOpen(next)
        if (next) onOpen?.()
        else {
            setActiveIndex(null)
            onClose?.()
        }
    }

    const [uncontrolledInput, setUncontrolledInput] = useState('')
    const inputValue = controlledInput ?? uncontrolledInput
    const setInputValue = (event: SyntheticEvent | null, next: string, reason: AutocompleteInputChangeReason): void => {
        if (controlledInput === undefined) setUncontrolledInput(next)
        onInputChange?.(event, next, reason)
    }

    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const listRef = useRef<(HTMLElement | null)[]>([])
    const inputRef = useRef<HTMLInputElement>(null)
    // Popup box sizing driven off the reference (input) rect via the `size` middleware. Kept in state
    // (not written imperatively) so React owns the style and can't clobber it between position updates.
    const [popperWidth, setPopperWidth] = useState<number | null>(null)
    const [popperMaxHeight, setPopperMaxHeight] = useState<number | null>(null)

    const selectedArray: T[] = isMultiple ? (Array.isArray(value) ? (value) : []) : []
    const singleValue = !isMultiple ? ((value as SingleValue<T>) ?? null) : null
    const singleValueInput = !isMultiple && singleValue !== null ? getLabel(singleValue) : ''

    useEffect(() => {
        if (controlledInput !== undefined || isMultiple) return

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUncontrolledInput(singleValueInput)
    }, [controlledInput, isMultiple, singleValueInput])

    const isSelected = (option: T): boolean =>
        isMultiple ? selectedArray.some((v) => isEqual(option, v)) : singleValue !== null && isEqual(option, singleValue)
    const isOptionDisabled = (option: T): boolean => getOptionDisabled?.(option) ?? isOptionObjectDisabled(option)

    const filtered = useMemo(() => {
        const base = [...options]
        if (filterOptions) return filterOptions(base, { inputValue })
        const selectedLabel = !isMultiple && singleValue !== null ? getLabel(singleValue).toLowerCase() : null
        if (!inputValue || inputValue.toLowerCase() === selectedLabel) return base
        const needle = inputValue.toLowerCase()
        return base.filter((option) => getLabel(option).toLowerCase().includes(needle))
        // getLabel is stable enough for this memo; options/inputValue are the real inputs.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options, inputValue, filterOptions, value])
    const visibleOptions = useMemo(() => filtered.slice(0, 100), [filtered])
    const enabledOptionIndexes = visibleOptions.flatMap((option, index) =>
        !isOptionDisabled(option) ? [index] : [],
    )
    const selectedOptionIndex = visibleOptions.findIndex(isSelected)

    useEffect(() => {
        if (!open) return
        const index = activeIndex ?? selectedOptionIndex
        if (index < 0) return
        const id = requestAnimationFrame(() => listRef.current[index]?.scrollIntoView({ block: 'nearest' }))
        return () => cancelAnimationFrame(id)
    }, [activeIndex, open, popperMaxHeight, selectedOptionIndex])

    const { refs, floatingStyles, context } = useFloating({
        open,
        onOpenChange: setOpen,
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
                apply({ rects, availableHeight }) {
                    // Match the popup width to the input exactly (not min-width — no wider, no narrower).
                    setPopperWidth(rects.reference.width)
                    setPopperMaxHeight(autoHeight ? availableHeight - 8 : Math.min(availableHeight - 8, 320))
                },
            }),
        ],
    })
    const dismiss = useDismiss(context)
    const role = useRole(context, { role: 'listbox' })
    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([dismiss, role])
    const referenceRef = useMergeRefs([refs.setReference])
    // Portal INTO the trigger's modal <dialog> when present (inertness). Popover API only for body portal.
    const portalRoot = useMemo(() => (open ? getOpenModalDialogAncestor(refs.reference.current) : undefined), [open, refs])
    const usePopoverLayer = shouldUsePopoverTopLayer(portalRoot)
    const floatingRef = useMergeRefs([useTopLayerRef(refs.setFloating, usePopoverLayer)])

    const getInitialActiveIndex = (direction: -1 | 1): number | null => {
        if (enabledOptionIndexes.includes(selectedOptionIndex)) return selectedOptionIndex
        return enabledOptionIndexes[direction === 1 ? 0 : enabledOptionIndexes.length - 1] ?? null
    }

    const moveActiveOption = (direction: -1 | 1): void => {
        if (enabledOptionIndexes.length === 0) return
        setActiveIndex((index) => {
            const position = enabledOptionIndexes.indexOf(index ?? selectedOptionIndex)
            if (position === -1) return enabledOptionIndexes[direction === 1 ? 0 : enabledOptionIndexes.length - 1] ?? null
            return enabledOptionIndexes[Math.min(Math.max(position + direction, 0), enabledOptionIndexes.length - 1)] ?? null
        })
    }

    const emitChange = (event: SyntheticEvent, option: T, close = !isMultiple || !disableCloseOnSelect): void => {
        if (isMultiple) {
            const exists = selectedArray.some((v) => isEqual(option, v))
            const next = exists ? selectedArray.filter((v) => !isEqual(option, v)) : [...selectedArray, option]
            onChange?.(
                event,
                next as never,
                exists ? 'removeOption' : 'selectOption',
                { option },
            )
            setInputValue(event, '', 'reset')
            if (close) setOpen(false)
        } else {
            onChange?.(event, option as never, 'selectOption', { option })
            setInputValue(event, getLabel(option), 'reset')
            if (close) setOpen(false)
        }
    }

    const clearValue = (event: SyntheticEvent): void => {
        onChange?.(event, (isMultiple ? [] : null) as never, 'clear', undefined)
        setInputValue(event, '', 'clear')
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === 'Enter' && !open) {
            event.preventDefault()
            setOpen(true)
        } else if (event.key === 'Enter' && activeIndex != null && visibleOptions[activeIndex] != null) {
            event.preventDefault()
            const option = visibleOptions[activeIndex]
            if (!isOptionDisabled(option)) emitChange(event, option, true)
        } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            if (!open) {
                setActiveIndex(getInitialActiveIndex(event.key === 'ArrowDown' ? 1 : -1))
                setOpen(true)
                return
            }
            moveActiveOption(event.key === 'ArrowDown' ? 1 : -1)
        } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault()
            setActiveIndex(enabledOptionIndexes[event.key === 'Home' ? 0 : enabledOptionIndexes.length - 1] ?? null)
        } else if (event.key === ' ' && activeIndex != null && visibleOptions[activeIndex] != null) {
            event.preventDefault()
            const option = visibleOptions[activeIndex]
            if (!isOptionDisabled(option)) emitChange(event, option, false)
        } else if (event.key === 'Escape') {
            event.preventDefault()
            setOpen(false)
        } else if (event.key === 'Tab') {
            setOpen(false)
        }
    }

    const showClear = !disableClearable && !readOnly && !disabled && (isMultiple ? selectedArray.length > 0 : singleValue !== null)

    // Activate on click so a pointer press can be cancelled and keyboard clicks work.
    // Mouse-down only preserves input focus; it must not change the value or popup.
    const togglePopupFromIcon = (event: React.MouseEvent): void => {
        event.preventDefault()
        if (disabled || readOnly) return
        inputRef.current?.focus()
        setOpen(!open)
    }

    const tags = isMultiple
        ? (renderValue
              ? renderValue(selectedArray, ({ index }) => ({ 'data-index': index }))
              : selectedArray.map((option, index) => (
                    <StyledChip
                        key={getOptionKey ? getOptionKey(option) : `${getLabel(option)}-${index}`}
                        dataTest={`selected-chip-${getLabel(option)}`}
                        label={getLabel(option)}
                        readOnly={readOnly}
                        onDelete={readOnly ? undefined : (event) => emitChange(event, option)}
                    />
                )))
        : undefined

    const endAdornment = (
        <span className='flex items-center gap-1'>
            {loading && <LoadingIcon width={20} height={20} className='animate-spin' />}
            {showClear && (
                <button
                    type='button'
                    tabIndex={-1}
                    aria-label='Clear'
                    data-testid={`${dataTest}-clear`}
                    className='flex min-h-6 min-w-6 cursor-pointer items-center justify-center rounded-full border-0 bg-delta-50'
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={clearValue}
                >
                    <CloseIcon width={20} height={20} className='text-delta-700' />
                </button>
            )}
            {readOnly ? null : (
                <button
                    type='button'
                    tabIndex={-1}
                    aria-label='Toggle options'
                    aria-expanded={open}
                    data-testid={`${dataTest}-popup-indicator`}
                    className='flex cursor-pointer items-center border-0 bg-transparent'
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={togglePopupFromIcon}
                >
                    {popupIcon ?? (isMultiple ? <PlusIconCircle width={24} height={24} className='text-delta-700' /> : (
                        <ChevronDownIcon
                            width={24}
                            height={24}
                            className={cn(
                                style['select-custom-icon'],
                                open && style['select-custom-icon-open'],
                                'text-delta-700',
                            )}
                        />
                    ))}
                </button>
            )}
        </span>
    )

    const renderInputParams: AutocompleteRenderInputParams = {
        disabled,
        size,
        fullWidth: true,
        error,
        helperText,
        value: inputValue,
        onChange: (event) => {
            setInputValue(event, event.target.value, 'input')
            if (!open) setOpen(true)
        },
        onKeyDown: handleKeyDown,
        slotProps: {
            htmlInput: {
                ...getReferenceProps(),
                ref: inputRef,
                onClick: () => setOpen(true),
                role: 'combobox',
                'aria-autocomplete': 'list',
                'aria-expanded': open,
                'aria-activedescendant':
                    open && activeIndex != null ? `${dataTest}-option-${activeIndex}` : undefined,
                autoComplete: 'off',
                readOnly,
            },
            input: { ref: referenceRef, startAdornment: tags, endAdornment },
        },
    }

    // MUI Autocomplete put option chrome on the `li` props (`className` / `MuiAutocomplete-option`).
    // Custom `renderOption` callers spread `{...props}` onto their `<li>` and expect flex, cursor,
    // hover, and selected backgrounds from that — not only from `defaultRenderOption`.
    const optionRowClassName = cn(
        // Figma Menus item: Body Base 16/lh24, text delta-800.
        'relative box-border flex min-h-10 cursor-pointer items-center gap-x-3 px-3 py-1.5 text-base text-delta-800',
        'aria-selected:bg-gama-50 hover:bg-delta-50',
        // Disabled options never take the gama highlight (hover or keyboard) and read as muted.
        'aria-disabled:cursor-default aria-disabled:!bg-transparent aria-disabled:text-delta-300',
    )

    const defaultRenderOption = (props: OptionLiProps, option: T, state: AutocompleteRenderOptionState): ReactNode => {
        const { key, ...optionProps } = props
        return (
            <li key={key} {...optionProps}>
                {props['data-active'] !== undefined && (
                    <span
                        aria-hidden='true'
                        className='pointer-events-none absolute inset-y-0 left-0 border-l border-solid border-focus-ring'
                    />
                )}
                {isMultiple ? (
                    // Pure state indicator: this <li> owns selection and carries the real accessible
                    // state via `aria-selected` (optionProps above). `decorative` renders no <input> at
                    // all — a real one (even inert-ed) is still a genuine axe `nested-interactive`
                    // violation. See DynamicSelectAutocomplete's equivalent fix (this exact pattern).
                    <StyledCheckbox
                        dataTest={`${dataTest}-${getLabel(option)}-checkbox`}
                        checked={state.selected}
                        size='small'
                        hideWrapper
                        decorative
                    />
                ) : (
                    <span className='w-5'>
                        {state.selected && <CheckIcon width={20} height={20} className='text-gama-500' />}
                    </span>
                )}
                {/* Long labels wrap to a second line and only then ellipsise (ASMA-7847): one
                    clipped line hid which organisation a row actually was. `break-words` mirrors
                    Figma's `word-break: break-word`, so an unbroken name still wraps. */}
                <span className='line-clamp-2 min-w-0 flex-1 break-words'>{getLabel(option)}</span>
            </li>
        )
    }

    const renderRow = (option: T, index: number): ReactNode => {
        const optionDisabled = isOptionDisabled(option)
        const props: OptionLiProps = {
            ...getItemProps({
                // MUI parity: keep the field focused on option click (otherwise the outline drops
                // from the focused state to the grey resting border).
                onMouseDown: (event) => event.preventDefault(),
                onClick: (event) => {
                    if (!optionDisabled) emitChange(event, option)
                },
                // Hover is a grey mouse state; the left focus border is reserved for keyboard navigation.
                onMouseMove: () => setActiveIndex(null),
            }),
            key: getOptionKey ? String(getOptionKey(option)) : `${getLabel(option)}-${index}`,
            ref: (node: HTMLLIElement | null) => {
                listRef.current[index] = node
            },
            role: 'option',
            id: `${dataTest}-option-${index}`,
            'aria-selected': isSelected(option),
            'aria-disabled': optionDisabled || undefined,
            'data-active': activeIndex === index ? '' : undefined,
            className: optionRowClassName,
        }
        const state: AutocompleteRenderOptionState = { selected: isSelected(option), index, inputValue }
        return renderOption ? renderOption(props, option, state) : defaultRenderOption(props, option, state)
    }

    return (
        <div className={cn(style['styledSelectAutocompleteWrapper'], !fullWidth && 'w-auto', wrapperClassName, className)}>
            {renderInput(renderInputParams)}
            {open && (
                <FloatingPortal root={portalRoot}>
                    <ul
                        ref={floatingRef}
                        {...(usePopoverLayer ? TOP_LAYER_PROPS : {})}
                        style={{
                            ...(usePopoverLayer ? TOP_LAYER_RESET_STYLE : {}),
                            ...floatingStyles,
                            // Exact input-matched width (overrides the UA `[popover]{width:fit-content}`).
                            width: popperWidth ?? undefined,
                            maxHeight: popperMaxHeight ?? undefined,
                            fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
                            ...slotProps?.popper?.style,
                        }}
                        {...getFloatingProps()}
                        className={cn(
                            // Figma Autocomplete dropdown = the Menus surface (node 16073-19226): radius 4,
                            // border/outline delta-300 (#bdc4cf), Menus shadow. Matches StyledSelect/StyledMenu.
                            // Figma Menus (node 34522-151497) pads the list `8px 0` — the rows run
                            // edge to edge horizontally, with 8px of breathing room top and bottom.
                            'z-[1300] m-0 list-none overflow-auto rounded border border-solid border-delta-300 bg-white px-0 py-2 shadow-[0px_2px_4px_0px_rgba(34,33,51,0.15)]',
                            // Figma Menus (node 34522-151497) separates the rows and leaves the last
                            // one clean. Owned by the LISTBOX, not the row, for two reasons: a custom
                            // `renderOption` that replaces `props.className` (a real pattern in
                            // consumers) silently dropped the row-level rule, and — because the
                            // separator and its last-row exclusion were two separate utilities — a page
                            // that loaded a generic `.border-b` from one bundle without the
                            // `last:border-b-0` rule from ours drew a stray line under the final
                            // option. One structural rule cannot come apart like that: no stylesheet,
                            // no separators at all, which still reads correctly.
                            '[&>li:not(:last-child)]:border-0 [&>li:not(:last-child)]:border-b',
                            '[&>li:not(:last-child)]:border-solid [&>li:not(:last-child)]:border-delta-200',
                            classes?.listbox,
                            slotProps?.popper?.className,
                        )}
                    >
                            {allowSelectAll && isMultiple && (
                                // Not one of the selectable options (never part of `visibleOptions`/
                                // arrow-key nav) — it's a toggle-all action, so it must NOT claim
                                // `role='option'` (that false premise was the actual cause of its
                                // `nested-interactive` violation: `option` disallows interactive
                                // descendants; a real, independently-focusable checkbox is perfectly
                                // valid once it isn't wrapped in a role that says it can't be). But a
                                // bare, roleless <li> isn't valid inside `role='listbox'` either (axe
                                // `aria-required-children`/`listitem`) — `role='group'` is the ARIA-listbox-
                                // valid child role that, unlike `option`, permits real interactive content.
                                // A plain `<div>` hosts it (not `<li>` — ARIA-in-HTML doesn't allow
                                // `role='group'` on `<li>`; `<div>` accepts any role, and `flex` layout
                                // doesn't care about tag name, so this is visually identical).
                                <div
                                    role='group'
                                    className='flex min-h-12 items-center gap-x-1 border-0 border-b border-solid border-delta-200 px-4 text-sm text-delta-700'
                                >
                                    <StyledCheckbox
                                        dataTest={`${dataTest}-select-all`}
                                        aria-label={selectAllLabel}
                                        checked={options.length > 0 && selectedArray.length === options.length}
                                        size='small'
                                        hideWrapper
                                        onChange={(event) => {
                                            event.stopPropagation()
                                            const allSelected = options.length > 0 && selectedArray.length === options.length
                                            onChange?.(
                                                event,
                                                (allSelected ? [] : options) as never,
                                                allSelected ? 'clear' : 'selectOption',
                                                undefined,
                                            )
                                        }}
                                    />
                                    <span className='flex-1 truncate py-2'>{selectAllLabel}</span>
                                </div>
                            )}
                            {loading ? (
                                // Placeholder text, not a selectable option — `role='presentation'`
                                // exempts it from `role='listbox'`'s required-children check (axe
                                // `aria-required-children`), which a bare, roleless <li> doesn't satisfy.
                                <li role='presentation' className='px-3 py-2 text-sm text-delta-600'>
                                    {loadingText}
                                </li>
                            ) : visibleOptions.length === 0 ? (
                                <li role='presentation' className='px-3 py-2 text-sm text-delta-600'>
                                    {noOptionsText}
                                </li>
                            ) : (
                                // Per-item ref callbacks populate the Floating UI listRef for keyboard nav;
                                // the react-compiler ref rule false-positives on the callback in map.
                                // eslint-disable-next-line react-hooks/refs
                                visibleOptions.map(renderRow)
                            )}
                    </ul>
                </FloatingPortal>
            )}
        </div>
    )
}
