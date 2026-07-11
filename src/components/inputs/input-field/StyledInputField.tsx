import {
    useId,
    useState,
    type ChangeEvent,
    type CSSProperties,
    type FocusEvent,
    type HTMLAttributes,
    type ReactNode,
    type Ref,
    type TextareaHTMLAttributes,
    type InputHTMLAttributes,
} from 'react'
import { CloseIcon, ErrorOutlineIcon } from 'src/components/icons'
import { cn } from 'src/helpers/cn'
import { resolveSx } from 'src/helpers/sx'
import { floatingLabelClass, outlineClass, type FieldSize } from '../field-styles'
import styles from './StyledInputField.module.scss'

interface InputSlot {
    startAdornment?: ReactNode
    endAdornment?: ReactNode
    className?: string
    style?: CSSProperties
    // MUI's input slot ref lands on the InputBase root (a div); allow either.
    ref?: Ref<HTMLInputElement | HTMLDivElement>
    [key: string]: unknown
}

type HtmlInputSlot = InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }

export interface StyledInputFieldProps {
    dataTest: string
    label?: ReactNode
    value?: string | number
    defaultValue?: string | number
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void
    onBlur?: (event: FocusEvent<HTMLInputElement>) => void
    onFocus?: (event: FocusEvent<HTMLInputElement>) => void
    error?: boolean
    helperText?: ReactNode
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    allowClear?: boolean
    onClear?: () => void
    type?: string
    placeholder?: string
    name?: string
    id?: string
    autoComplete?: string
    autoFocus?: boolean
    multiline?: boolean
    rows?: number
    minRows?: number
    maxRows?: number
    size?: FieldSize
    /** Accepted for API parity; the design always renders outlined. */
    variant?: string
    fullWidth?: boolean
    className?: string
    style?: CSSProperties
    sx?: unknown
    inputRef?: Ref<HTMLInputElement | HTMLTextAreaElement>
    slotProps?: {
        input?: InputSlot
        htmlInput?: HtmlInputSlot
        inputLabel?: HTMLAttributes<HTMLLabelElement> & Record<string, unknown>
        formHelperText?: { sx?: unknown; className?: string }
    }
    /** Legacy MUI adornment slot (still used by ~22 call sites). */
    InputProps?: InputSlot
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
}

/**
 * Outlined text field with a floating label (replaces MUI `TextField`). Self-contained: manages its
 * own focus/value state to drive the shared field styling ([[field-styles]]); supports multiline,
 * start/end adornments, an optional clear button, and error/helper text. Public props preserved
 * (DEC-003). TASK-401.
 *
 * ponytail: `variant` is accepted but always renders outlined, and multiline uses fixed `rows`
 * (no auto-grow to `maxRows`) — known ceilings; Chromatic in CI is the visual gate.
 */
export const StyledInputField = ({
    dataTest,
    label,
    value,
    defaultValue,
    onChange,
    onBlur,
    onFocus,
    error,
    helperText,
    disabled,
    readOnly,
    required,
    allowClear,
    onClear,
    type = 'text',
    placeholder,
    name,
    id,
    autoComplete,
    autoFocus,
    multiline,
    rows,
    minRows,
    maxRows: _maxRows,
    size = 'medium',
    fullWidth,
    className,
    style,
    sx,
    inputRef,
    slotProps,
    InputProps,
    onKeyDown,
    variant: _variant,
}: StyledInputFieldProps): JSX.Element => {
    const generatedId = useId()
    const fieldId = id ?? generatedId
    const [focused, setFocused] = useState(false)
    const [hasValueUncontrolled, setHasValueUncontrolled] = useState(
        defaultValue != null && defaultValue !== '',
    )

    const isControlled = value !== undefined
    const hasValue = isControlled ? value !== '' && value != null : hasValueUncontrolled
    const disabledOrReadonly = Boolean(disabled) || Boolean(readOnly)

    const startAdornment = slotProps?.input?.startAdornment ?? InputProps?.startAdornment
    const userEndAdornment = slotProps?.input?.endAdornment ?? InputProps?.endAdornment
    const showClear = Boolean(allowClear && hasValue && !disabledOrReadonly)

    // The MUI input slot lets callers pass their own ref via `slotProps.htmlInput.ref` (Autocomplete
    // does this); prefer an explicit `inputRef`, else fall back to it.
    const { ref: htmlInputRef, ...htmlInputRest } = slotProps?.htmlInput ?? {}
    const resolvedRef = (inputRef ?? htmlInputRef) as Ref<HTMLInputElement & HTMLTextAreaElement>
    const { className: inputSlotClass, style: inputSlotStyle, ref: inputSlotRef } = slotProps?.input ?? {}

    const shrink = focused || hasValue || Boolean(placeholder) || Boolean(startAdornment)

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
        if (readOnly) return
        if (!isControlled) setHasValueUncontrolled(event.target.value !== '')
        onChange?.(event)
    }
    const handleFocus = (event: FocusEvent<HTMLInputElement>): void => {
        setFocused(true)
        onFocus?.(event)
    }
    const handleBlur = (event: FocusEvent<HTMLInputElement>): void => {
        setFocused(false)
        onBlur?.(event)
    }

    const sharedProps = {
        ...htmlInputRest,
        id: fieldId,
        name,
        placeholder: shrink ? placeholder : undefined,
        disabled: disabledOrReadonly,
        readOnly,
        required,
        autoComplete,
        autoFocus,
        value,
        defaultValue,
        'aria-invalid': error ? true : undefined,
        onChange: handleChange,
        onFocus: handleFocus,
        onBlur: handleBlur,
        onKeyDown,
    }

    const inputClasses = cn(
        styles['Input'],
        'peer w-full rounded-lg bg-transparent text-delta-800 outline-none placeholder:text-delta-500',
        'disabled:text-delta-300',
        readOnly && 'bg-delta-10 text-delta-800',
        size === 'small' ? 'text-sm' : 'text-base',
        multiline ? 'resize-none py-2' : size === 'small' ? 'h-9' : 'h-12',
        // Set each horizontal padding with exactly ONE utility. `px-3` + `pl-10`/`pr-10` are
        // conflicting shorthands; since `cn()` no longer runs tailwind-merge (dropped in the
        // MUI-removal Phase 0), both survive and the winner depends on stylesheet order — across the
        // MFE bundles `px-3` wins, so the adornment overlaps the caret. Choosing the side explicitly
        // avoids the conflict entirely.
        startAdornment ? 'pl-10' : 'pl-3',
        showClear || !!userEndAdornment ? 'pr-10' : 'pr-3',
        inputSlotClass,
    )

    return (
        <div
            className={cn('group relative inline-flex flex-col', fullWidth && 'w-full', className)}
            style={{ ...resolveSx(sx), ...style }}
        >
            <div className='relative flex items-center' ref={inputSlotRef}>
                {multiline ? (
                    <textarea
                        {...(sharedProps as unknown as TextareaHTMLAttributes<HTMLTextAreaElement>)}
                        ref={resolvedRef}
                        data-testid={dataTest}
                        rows={rows ?? minRows ?? 3}
                        className={inputClasses}
                        style={inputSlotStyle}
                    />
                ) : (
                    <input
                        {...(sharedProps)}
                        ref={resolvedRef}
                        data-testid={dataTest}
                        type={type}
                        className={inputClasses}
                        style={inputSlotStyle}
                    />
                )}

                {label && (
                    <label
                        htmlFor={fieldId}
                        className={cn(
                            floatingLabelClass({ shrink, focused, error, disabled, size }),
                            slotProps?.inputLabel?.className,
                        )}
                        style={resolveSx(slotProps?.inputLabel?.['sx'])}
                    >
                        {label}
                        {required && ' *'}
                    </label>
                )}

                {startAdornment && (
                    <span className='absolute left-3 flex items-center text-delta-500'>{startAdornment}</span>
                )}
                {showClear ? (
                    <div
                        role='button'
                        data-testid={`${dataTest}-clear`}
                        className='absolute right-3 z-40 flex items-center justify-center rounded-full p-[2px] duration-300 hover:bg-gama-100'
                        onClick={(event) => {
                            event.stopPropagation()
                            event.preventDefault()
                            if (!isControlled) setHasValueUncontrolled(false)
                            onClear?.()
                        }}
                    >
                        <CloseIcon width={18} height={18} />
                    </div>
                ) : (
                    userEndAdornment && <span className='absolute right-3 flex items-center'>{userEndAdornment}</span>
                )}

                <div className={outlineClass({ focused, error, disabled, readOnly })} />
            </div>

            {!readOnly && helperText != null && (
                <p
                    className={cn(
                        'm-0 min-h-6 text-sm leading-6',
                        error ? 'flex items-start gap-1 text-error-500' : 'text-delta-600',
                        slotProps?.formHelperText?.className,
                    )}
                    style={resolveSx(slotProps?.formHelperText?.sx)}
                >
                    {error && <ErrorOutlineIcon width={20} height={20} className='min-w-5 shrink-0 translate-y-[2px]' />}
                    <span className='min-w-0 flex-1'>{error ? helperText || 'Required' : helperText}</span>
                </p>
            )}
        </div>
    )
}
