import {
    Children,
    cloneElement,
    isValidElement,
    useEffect,
    useRef,
    useState,
    type KeyboardEvent,
    type ReactElement,
    type ReactNode,
} from 'react'
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
import { ChevronDownIcon, CloseIcon, ErrorOutlineIcon } from 'src/components/icons'
import { cn } from 'src/helpers/cn'
import { resolveSx } from 'src/helpers/sx'
import { useFormControlContext } from '../../miscellaneous/FormControlContext'
import { StyledFormHelperText } from '../../miscellaneous/StyledFormHelperText'
import { outlineClass, type FieldSize } from '../field-styles'
import type { StyledSelectItemProps } from './StyledSelectItem'

export interface SelectChangeEvent<T = unknown> {
    target: { value: T; name?: string }
}

export interface StyledSelectProps {
    dataTest: string
    value?: unknown
    defaultValue?: unknown
    onChange?: (event: SelectChangeEvent, child: ReactNode) => void
    size?: FieldSize
    error?: boolean
    errorText?: string
    allowClear?: boolean
    disabled?: boolean
    readOnly?: boolean
    name?: string
    placeholder?: string
    displayEmpty?: boolean
    renderValue?: (value: unknown) => ReactNode
    fullWidth?: boolean
    className?: string
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
    renderValue,
    fullWidth,
    className,
    sx,
    children,
    MenuProps,
}: StyledSelectProps): JSX.Element => {
    const ctx = useFormControlContext()
    const fieldSize: FieldSize = size ?? ctx?.size ?? 'medium'
    const isError = error ?? ctx?.error ?? false
    const isDisabled = disabled ?? ctx?.disabled ?? false

    const [open, setOpen] = useState(false)
    const [uncontrolled, setUncontrolled] = useState(defaultValue)
    const isControlled = value !== undefined
    const currentValue = isControlled ? value : uncontrolled
    const hasValue = currentValue !== undefined && currentValue !== '' && currentValue !== null

    const listRef = useRef<HTMLUListElement>(null)

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
                apply({ rects, elements }) {
                    elements.floating.style.minWidth = `${rects.reference.width}px`
                },
            }),
        ],
    })
    const click = useClick(context, { enabled: !isDisabled && !readOnly })
    const dismiss = useDismiss(context)
    const role = useRole(context, { role: 'listbox' })
    const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role])
    const triggerRef = useMergeRefs([refs.setReference])
    const listboxRef = useMergeRefs([refs.setFloating, listRef])

    // Report state into the surrounding FormControl so the label floats.
    useEffect(() => ctx?.setFocused(open), [open, ctx])
    useEffect(() => ctx?.setFilled(hasValue || Boolean(placeholder) || Boolean(displayEmpty)), [
        hasValue,
        placeholder,
        displayEmpty,
        ctx,
    ])

    const selectValue = (next: unknown, child: ReactNode): void => {
        if (!isControlled) setUncontrolled(next)
        onChange?.({ target: { value: next, name } }, child)
        setOpen(false)
    }

    const options = Children.map(children, (child) => {
        if (!isValidElement<StyledSelectItemProps>(child)) return child
        const itemValue = child.props.value
        return cloneElement(child, {
            selected: itemValue === currentValue,
            onClick: () => selectValue(itemValue, child.props.children),
        })
    })

    // The selected option's label drives the trigger display (unless renderValue overrides).
    const selectedChild = Children.toArray(children).find(
        (child): child is ReactElement<StyledSelectItemProps> =>
            isValidElement<StyledSelectItemProps>(child) && child.props.value === currentValue,
    )
    const shownValue = renderValue ? renderValue(currentValue) : selectedChild?.props.children

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
        <div className={cn('group relative inline-flex flex-col', fullWidth && 'w-full', className)} style={resolveSx(sx)}>
            <button
                ref={triggerRef}
                type='button'
                data-testid={dataTest}
                role='combobox'
                aria-haspopup='listbox'
                aria-expanded={open}
                aria-disabled={isDisabled ? true : undefined}
                disabled={isDisabled}
                {...getReferenceProps()}
                className={cn(
                    'relative flex w-full items-center justify-between rounded-lg bg-transparent px-3 text-left text-delta-800 outline-none',
                    fieldSize === 'small' ? 'h-9 text-sm' : 'h-12 text-base',
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
                            data-testid={`${dataTest}-clear`}
                            className='flex items-center justify-center rounded-full p-[2px] hover:bg-gama-100'
                            onClick={(event) => {
                                event.stopPropagation()
                                selectValue('', null)
                            }}
                        >
                            <CloseIcon width={18} height={18} />
                        </span>
                    )}
                    <ChevronDownIcon
                        width={24}
                        height={24}
                        className={cn('transition-transform', open && 'rotate-180')}
                    />
                </span>
                <div className={outlineClass({ focused: open, error: isError, disabled: isDisabled, readOnly })} />
            </button>

            {open && (
                <FloatingPortal>
                    <ul
                        ref={listboxRef}
                        role='listbox'
                        aria-label={name}
                        style={floatingStyles}
                        {...getFloatingProps()}
                        onKeyDown={handleKeyDown}
                        className={cn(
                            'z-[1300] max-h-72 overflow-auto rounded-lg border border-delta-300 bg-white py-1 shadow-[0px_2px_4px_0px_rgba(34,33,51,0.15)]',
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
