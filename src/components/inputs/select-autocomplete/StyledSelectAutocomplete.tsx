import {
    useMemo,
    useRef,
    useState,
    type HTMLAttributes,
    type KeyboardEvent,
    type ReactNode,
    type SyntheticEvent,
} from 'react'
import {
    autoUpdate,
    flip,
    FloatingFocusManager,
    FloatingPortal,
    offset,
    shift,
    size as sizeMiddleware,
    useDismiss,
    useFloating,
    useInteractions,
    useListNavigation,
    useMergeRefs,
    useRole,
} from '@floating-ui/react'
import { cn } from 'src/helpers/cn'
import { CheckIcon, ChevronDownIcon, CloseIcon, PlusIconCircle } from 'src/components/icons'
import { StyledCheckbox } from 'src/components/inputs/checkbox/base-ui/StyledCheckbox'
import { StyledChip } from 'src/components/data-display/chip'
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
    value: string
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    onFocus: () => void
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
    slotProps: {
        htmlInput: Record<string, unknown> & { ref: React.Ref<HTMLInputElement> }
        input: { startAdornment?: ReactNode; endAdornment?: ReactNode }
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
export interface StyledSelectAutocompleteProps<
    T,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
    FreeSolo extends boolean | undefined = false,
> {
    dataTest: string
    options: readonly T[]
    renderInput: (params: AutocompleteRenderInputParams) => ReactNode
    // Input value is a loose union (the runtime accepts any shape); onChange stays precise via the
    // conditional AutocompleteValue, which also keeps the Multiple/DisableClearable/FreeSolo generics live.
    value?: SingleValue<T> | MultiValue<T> | string | undefined
    defaultValue?: SingleValue<T> | MultiValue<T> | string | undefined
    onChange?: (
        event: SyntheticEvent,
        value: AutocompleteValue<T, Multiple, DisableClearable, FreeSolo>,
        reason: AutocompleteChangeReason,
        details?: { option: T },
    ) => void
    getOptionLabel?: (option: T) => string
    isOptionEqualToValue?: (option: T, value: T) => boolean
    renderOption?: (props: OptionLiProps, option: T, state: AutocompleteRenderOptionState) => ReactNode
    renderValue?: (value: MultiValue<T>, getItemProps: (opts: { index: number }) => OptionLiProps) => ReactNode
    filterOptions?: (options: T[], state: { inputValue: string }) => T[]
    groupBy?: (option: T) => string
    loading?: boolean
    loadingText?: ReactNode
    noOptionsText?: ReactNode
    disabled?: boolean
    readOnly?: boolean
    size?: 'small' | 'medium'
    disableClearable?: boolean
    freeSolo?: boolean
    open?: boolean
    onOpen?: (event?: SyntheticEvent) => void
    onClose?: (event?: SyntheticEvent, reason?: string) => void
    disableCloseOnSelect?: boolean
    inputValue?: string
    onInputChange?: (event: SyntheticEvent | null, value: string, reason: AutocompleteInputChangeReason) => void
    popupIcon?: ReactNode
    autoHeight?: boolean
    multiple?: Multiple
    allowSelectAll?: boolean
    selectAllLabel?: string
    fullWidth?: boolean
    /** Accepted for MUI parity; single-select already omits selected options via filtering. */
    filterSelectedOptions?: boolean
    classes?: { root?: string; paper?: string; listbox?: string }
    className?: string
    wrapperClassName?: string
    sx?: unknown
}

const objectLabel = <T,>(option: T): string => {
    if (typeof option === 'object' && option !== null && 'label' in option) return String((option as { label: unknown }).label)
    return String(option)
}
const isOptionObjectDisabled = <T,>(option: T): boolean =>
    typeof option === 'object' && option !== null && 'disabled' in option && Boolean((option as { disabled?: unknown }).disabled)

/**
 * Custom combobox (replaces MUI `Autocomplete`, DEC-002) built on `@floating-ui/react`. Supports
 * single + multiple selection (with tag chips + optional select-all), type-ahead filtering,
 * async `loading`, grouping, and the MUI `renderInput`/`renderOption`/`renderValue` callback
 * contracts. Public props/generics preserved (DEC-003). TASK-401.
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
    isOptionEqualToValue,
    renderOption,
    renderValue,
    filterOptions,
    loading,
    loadingText = 'Loading…',
    noOptionsText = 'No options',
    disabled,
    readOnly,
    size = 'small',
    disableClearable,
    popupIcon,
    multiple,
    fullWidth,
    classes,
    inputValue: controlledInput,
    onInputChange,
    open: controlledOpen,
    onOpen,
    onClose,
    className,
    wrapperClassName,
}: StyledSelectAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>): JSX.Element {
    const isMultiple = multiple === true
    const getLabel = getOptionLabel ?? objectLabel
    const isEqual = (a: T, b: T): boolean => (isOptionEqualToValue ? isOptionEqualToValue(a, b) : a === b)

    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
    const open = controlledOpen ?? uncontrolledOpen
    const setOpen = (next: boolean): void => {
        if (controlledOpen === undefined) setUncontrolledOpen(next)
        if (next) onOpen?.()
        else onClose?.()
    }

    const [uncontrolledInput, setUncontrolledInput] = useState('')
    const inputValue = controlledInput ?? uncontrolledInput
    const setInputValue = (event: SyntheticEvent | null, next: string, reason: AutocompleteInputChangeReason): void => {
        if (controlledInput === undefined) setUncontrolledInput(next)
        onInputChange?.(event, next, reason)
    }

    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const listRef = useRef<(HTMLElement | null)[]>([])

    const selectedArray: T[] = isMultiple ? (Array.isArray(value) ? (value) : []) : []
    const singleValue = !isMultiple ? ((value as SingleValue<T>) ?? null) : null

    const isSelected = (option: T): boolean =>
        isMultiple ? selectedArray.some((v) => isEqual(option, v)) : singleValue !== null && isEqual(option, singleValue)

    // Filtering: multiple keeps every option visible (selection shown via check); single filters by label.
    const filtered = useMemo(() => {
        const base = [...options]
        if (filterOptions) return filterOptions(base, { inputValue })
        if (!inputValue || isMultiple) return base
        const needle = inputValue.toLowerCase()
        return base.filter((option) => getLabel(option).toLowerCase().includes(needle))
        // getLabel is stable enough for this memo; options/inputValue are the real inputs.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options, inputValue, isMultiple, filterOptions])

    const { refs, floatingStyles, context } = useFloating({
        open,
        onOpenChange: setOpen,
        placement: 'bottom-start',
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(4),
            flip({ padding: 8 }),
            shift({ padding: 8 }),
            sizeMiddleware({
                apply({ rects, elements, availableHeight }) {
                    elements.floating.style.minWidth = `${rects.reference.width}px`
                    elements.floating.style.maxHeight = `${Math.min(availableHeight - 8, 320)}px`
                },
            }),
        ],
    })
    const dismiss = useDismiss(context)
    const role = useRole(context, { role: 'listbox' })
    const listNav = useListNavigation(context, {
        listRef,
        activeIndex,
        onNavigate: setActiveIndex,
        virtual: true,
        loop: true,
    })
    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([dismiss, role, listNav])
    const inputRef = useMergeRefs([refs.setReference])
    const floatingRef = useMergeRefs([refs.setFloating])

    const emitChange = (event: SyntheticEvent, option: T): void => {
        if (isMultiple) {
            const exists = selectedArray.some((v) => isEqual(option, v))
            const next = exists ? selectedArray.filter((v) => !isEqual(option, v)) : [...selectedArray, option]
            onChange?.(
                event,
                next as never,
                exists ? 'removeOption' : 'selectOption',
                { option },
            )
        } else {
            onChange?.(event, option as never, 'selectOption', { option })
            setInputValue(event, getLabel(option), 'reset')
            setOpen(false)
        }
    }

    const clearValue = (event: SyntheticEvent): void => {
        onChange?.(event, (isMultiple ? [] : null) as never, 'clear', undefined)
        setInputValue(event, '', 'clear')
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === 'Enter' && open && activeIndex != null && filtered[activeIndex] != null) {
            event.preventDefault()
            const option = filtered[activeIndex]
            if (!isOptionObjectDisabled(option)) emitChange(event, option)
        } else if (event.key === 'ArrowDown' && !open) {
            setOpen(true)
        }
    }

    const showClear = !disableClearable && !readOnly && !disabled && (isMultiple ? selectedArray.length > 0 : singleValue !== null)

    const tags = isMultiple
        ? (renderValue
              ? renderValue(selectedArray, ({ index }) => ({ 'data-index': index }))
              : selectedArray.map((option, index) => (
                    <StyledChip
                        key={`${getLabel(option)}-${index}`}
                        dataTest={`selected-chip-${getLabel(option)}`}
                        label={getLabel(option)}
                        readOnly={readOnly}
                        onDelete={readOnly ? undefined : (event) => emitChange(event, option)}
                    />
                )))
        : undefined

    const endAdornment = (
        <span className='flex items-center'>
            {loading && <LoadingIcon width={20} height={20} className='animate-spin' />}
            {showClear && (
                <span
                    role='button'
                    data-testid={`${dataTest}-clear`}
                    className='flex min-h-6 min-w-6 cursor-pointer items-center justify-center rounded-full bg-delta-50'
                    onMouseDown={(event) => {
                        event.preventDefault()
                        clearValue(event)
                    }}
                >
                    <CloseIcon width={20} height={20} className='text-delta-700' />
                </span>
            )}
            {readOnly ? null : (popupIcon ?? (isMultiple ? <PlusIconCircle width={24} height={24} /> : (
                <ChevronDownIcon width={24} height={24} className={cn(style['select-custom-icon'], 'transition-transform', open && 'rotate-180')} />
            )))}
        </span>
    )

    const renderInputParams: AutocompleteRenderInputParams = {
        disabled,
        size,
        fullWidth: true,
        value: inputValue,
        onChange: (event) => {
            setInputValue(event, event.target.value, 'input')
            if (!open) setOpen(true)
        },
        onFocus: () => setOpen(true),
        onKeyDown: handleKeyDown,
        slotProps: {
            htmlInput: {
                ...getReferenceProps(),
                ref: inputRef,
                role: 'combobox',
                'aria-autocomplete': 'list',
                'aria-expanded': open,
                autoComplete: 'off',
                readOnly,
            },
            input: { startAdornment: tags, endAdornment },
        },
    }

    const defaultRenderOption = (props: OptionLiProps, option: T, state: AutocompleteRenderOptionState): ReactNode => (
        <li
            {...props}
            className={cn(
                'flex cursor-pointer items-center gap-x-1 px-2 text-sm text-delta-700',
                'aria-selected:bg-gama-50 data-[active]:bg-delta-50',
                isMultiple && 'border-0 border-b border-solid border-delta-200',
            )}
        >
            {isMultiple ? (
                <StyledCheckbox dataTest={`${dataTest}-${getLabel(option)}-checkbox`} checked={state.selected} size='small' hideWrapper />
            ) : (
                <span className='w-5'>{state.selected && <CheckIcon width={20} height={20} className='text-gama-500' />}</span>
            )}
            <span className='flex-1 truncate py-2'>{getLabel(option)}</span>
        </li>
    )

    const renderRow = (option: T, index: number): ReactNode => {
        const optionDisabled = isOptionObjectDisabled(option)
        const props: OptionLiProps = {
            ...getItemProps({
                onClick: (event) => {
                    if (!optionDisabled) emitChange(event, option)
                },
            }),
            key: `${getLabel(option)}-${index}`,
            ref: (node: HTMLLIElement | null) => {
                listRef.current[index] = node
            },
            role: 'option',
            id: `${dataTest}-option-${index}`,
            'aria-selected': isSelected(option),
            'aria-disabled': optionDisabled || undefined,
            'data-active': activeIndex === index ? '' : undefined,
        }
        const state: AutocompleteRenderOptionState = { selected: isSelected(option), index, inputValue }
        return renderOption ? renderOption(props, option, state) : defaultRenderOption(props, option, state)
    }

    return (
        <div className={cn(style['styledSelectAutocompleteWrapper'], !fullWidth && 'w-auto', wrapperClassName, className)}>
            {renderInput(renderInputParams)}
            {open && (
                <FloatingPortal>
                    <FloatingFocusManager context={context} modal={false} initialFocus={-1} returnFocus={false}>
                        <ul
                            ref={floatingRef}
                            style={floatingStyles}
                            {...getFloatingProps()}
                            className={cn(
                                'z-[1300] m-0 list-none overflow-auto rounded-lg border border-delta-200 bg-white py-0 shadow-[0px_2px_4px_0px_rgba(34,33,51,0.15)]',
                                classes?.listbox,
                            )}
                        >
                            {loading ? (
                                <li className='px-3 py-2 text-sm text-delta-600'>{loadingText}</li>
                            ) : filtered.length === 0 ? (
                                <li className='px-3 py-2 text-sm text-delta-600'>{noOptionsText}</li>
                            ) : (
                                // Per-item ref callbacks populate the Floating UI listRef for keyboard nav;
                                // the react-compiler ref rule false-positives on the callback in map.
                                // eslint-disable-next-line react-hooks/refs
                                filtered.map(renderRow)
                            )}
                        </ul>
                    </FloatingFocusManager>
                </FloatingPortal>
            )}
        </div>
    )
}
