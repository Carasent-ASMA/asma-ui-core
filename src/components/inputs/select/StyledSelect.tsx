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
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
    type ReactElement,
    type ReactNode,
} from 'react'
import { ChevronDownIcon, CloseIcon, ErrorOutlineIcon } from 'src/components/icons'
import { cn } from 'src/helpers/cn'
import { resolveSx } from 'src/helpers/sx'
import { TOP_LAYER_PROPS, TOP_LAYER_RESET_STYLE, useTopLayerRef } from 'src/hooks/useTopLayer.hook'
import { useFormControlContext } from '../../miscellaneous/FormControlContext'
import { StyledFormHelperText } from '../../miscellaneous/StyledFormHelperText'
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
 * Non-annotated props are behavioral / MUI `Select` API-parity (DEC-003).
 */
export interface StyledSelectProps {
    /** @figmaProp none — test hook */
    dataTest: string
    /** @figmaProp Filled + trigger display value */
    value?: unknown
    /** @figmaProp Filled (initial, uncontrolled) */
    defaultValue?: unknown
    onChange?: (event: SelectChangeEvent, child: ReactNode) => void
    /** @figmaProp none — FieldSize (both render the 40px field; small uses text-sm) */
    size?: FieldSize
    /** @figmaProp State = true→"Error" */
    error?: boolean
    errorText?: string
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
    /** Accepted for API parity; `standard` renders borderless (calendar month/year dropdowns). */
    variant?: 'outlined' | 'standard' | string
    sx?: unknown
    labelId?: string
    children?: ReactNode
    MenuProps?: { className?: string }
}

/**
 * Single-select dropdown (replaces MUI `Select`) — a trigger styled as the outlined field plus a
 * portalled `role="listbox"`. Reports open/filled into a surrounding `StyledFormControl` so its
 * `StyledInputLabel` floats. Public props preserved (DEC-003). Use inside `StyledFormControl`.
 * TASK-402.
 */
export const StyledSelect = ({
    dataTest,
    value,
    defaultValue,
    onChange,
    size,
    error,
    errorText,
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
}: StyledSelectProps): JSX.Element => {
    const ctx = useFormControlContext()
    const fieldSize: FieldSize = size ?? ctx?.size ?? 'medium'
    const isStandard = variant === 'standard'
    const isError = error ?? ctx?.error ?? false
    const isDisabled = disabled ?? ctx?.disabled ?? false

    const [open, setOpen] = useState(false)
    const [focused, setFocused] = useState(false)
    const [uncontrolled, setUncontrolled] = useState(defaultValue)
    const isControlled = value !== undefined
    const currentValue = isControlled ? value : uncontrolled
    const hasValue = Array.isArray(currentValue)
        ? currentValue.length > 0
        : currentValue !== undefined && currentValue !== '' && currentValue !== null

    const listRef = useRef<HTMLUListElement>(null)

    const { refs, floatingStyles, context } = useFloating({
        open,
        onOpenChange: setOpen,
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
    const triggerRef = useMergeRefs([refs.setReference])
    // Promote the listbox into the top layer so it paints above a modal <dialog> regardless of z-index.
    const listboxRef = useMergeRefs([useTopLayerRef(refs.setFloating), listRef])

    // Report state into the surrounding FormControl so the label floats.
    useEffect(() => ctx?.setFocused(open || focused), [open, focused, ctx])
    useEffect(() => ctx?.setFilled(hasValue || Boolean(placeholder) || Boolean(displayEmpty)), [
        hasValue,
        placeholder,
        displayEmpty,
        ctx,
    ])

    const selectValue = (next: unknown, child: ReactNode): void => {
        const selected = multiple
            ? (Array.isArray(currentValue) && currentValue.includes(next)
                  ? currentValue.filter((item) => item !== next)
                  : [...(Array.isArray(currentValue) ? currentValue : []), next])
            : next
        if (!isControlled) setUncontrolled(selected)
        onChange?.({ target: { value: selected, name } }, child)
        if (!multiple) {
            setOpen(false)
            requestAnimationFrame(() => (refs.domReference.current as HTMLElement | null)?.focus())
        }
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
                .map((child) => child.props.children)
                .join(', ')
          : selectedChild?.props.children

    const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
        if ((event.key !== 'ArrowDown' && event.key !== 'ArrowUp') || isDisabled || readOnly) return
        event.preventDefault()
        setOpen(true)
        requestAnimationFrame(() => {
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

    return (
        <div
            className={cn('group relative inline-flex flex-col', fullWidth && 'w-full', className)}
            style={{ fontFamily: 'Roboto, Helvetica, Arial, sans-serif', ...resolveSx(sx), ...style }}
        >
            <button
                ref={triggerRef}
                type='button'
                data-testid={dataTest}
                role='combobox'
                aria-haspopup='listbox'
                aria-expanded={open}
                aria-disabled={isDisabled ? true : undefined}
                disabled={isDisabled}
                {...getReferenceProps({ onKeyDown: handleTriggerKeyDown })}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{ minWidth: hasValue && !isStandard ? 105 : undefined }}
                className={cn(
                    'relative flex w-full items-center justify-between bg-transparent text-left text-delta-800 outline-none',
                    isStandard
                        ? cn('min-w-0 border-0 px-0', fieldSize === 'small' ? 'h-10 text-sm' : 'h-10 text-base')
                        : cn(
                              'rounded-lg border-0 px-3',
                              fieldSize === 'small' ? 'h-10 text-sm' : 'h-10 text-base',
                          ),
                    isDisabled && 'cursor-not-allowed text-delta-300',
                    readOnly && 'pointer-events-none',
                )}
            >
                <span className={cn('min-w-0 flex-1 truncate', !hasValue && 'text-delta-500')}>
                    {hasValue || displayEmpty ? shownValue : placeholder}
                </span>
                <span className='flex items-center gap-1'>
                    {allowClear && hasValue && !isDisabled && (
                        <span
                            role='button'
                            data-testid='select-clear-button'
                            className='flex items-center justify-center rounded-full p-[2px] hover:bg-gama-100'
                            onClick={(event) => {
                                event.stopPropagation()
                                const cleared = multiple ? [] : ''
                                if (!isControlled) setUncontrolled(cleared)
                                onChange?.({ target: { value: cleared, name } }, null)
                                setOpen(false)
                                setFocused(false)
                            }}
                        >
                            <CloseIcon width={18} height={18} />
                        </span>
                    )}
                    <ChevronDownIcon
                        width={24}
                        height={24}
                        className={cn('shrink-0 text-delta-700 transition-transform', open && 'rotate-180')}
                    />
                </span>
                {!isStandard && (
                    <div className={outlineClass({ focused: open || focused, error: isError, disabled: isDisabled, readOnly })} />
                )}
            </button>

            {open && (
                <FloatingPortal>
                    <ul
                        ref={listboxRef}
                        role='listbox'
                        aria-label={name}
                        {...TOP_LAYER_PROPS}
                        style={{ ...TOP_LAYER_RESET_STYLE, ...floatingStyles, fontFamily: 'Roboto, Helvetica, Arial, sans-serif' }}
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

            {isError && (
                <StyledFormHelperText className='m-0 flex items-center gap-1 pt-1 text-sm text-error-500'>
                    <ErrorOutlineIcon width={20} height={20} />
                    {errorText ?? 'Required'}
                </StyledFormHelperText>
            )}
        </div>
    )
}
