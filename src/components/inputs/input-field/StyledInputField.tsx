import { useMergeRefs } from '@floating-ui/react'
import {
    Children,
    useCallback,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type ChangeEvent,
    type CSSProperties,
    type FocusEvent,
    type HTMLAttributes,
    type InputHTMLAttributes,
    type ReactNode,
    type Ref,
    type TextareaHTMLAttributes,
} from 'react'
import { CloseIcon, ErrorOutlineIcon } from 'src/components/icons'
import { cn } from 'src/helpers/cn'
import { resolveSx } from 'src/helpers/sx'
import {
    floatingLabelClass,
    notchedLegendClass,
    notchedOutlineClass,
    type FieldSize,
} from '../field-styles'
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

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#15561-37391
 * Figma "Input field" component. The Figma **State** property (Enabled/Hovered/Active-Focused/
 * Error/Disabled/Read only) is driven by native focus/hover + the `error`/`disabled`/`readOnly`
 * props; **Filled** (on/off) is derived from `value`/`defaultValue`. **Unify** and **Mixed state**
 * are Figma-authoring properties with no React counterpart. Non-annotated props are behavioral /
 * MUI `TextField` API-parity (DEC-003).
 */
export interface StyledInputFieldProps {
    /** @figmaProp none — test hook */
    dataTest: string
    /** @figmaProp Label element (floating) */
    label?: ReactNode
    /** @figmaProp Filled = (value != '')→"on" | else→"off" */
    value?: string | number
    /** @figmaProp Filled = (defaultValue != '')→"on" | else→"off" */
    defaultValue?: string | number
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void
    onBlur?: (event: FocusEvent<HTMLInputElement>) => void
    onFocus?: (event: FocusEvent<HTMLInputElement>) => void
    /** @figmaProp State = true→"Error" */
    error?: boolean
    /** @figmaProp Helper text element */
    helperText?: ReactNode
    /** @figmaProp State = true→"Disabled" */
    disabled?: boolean
    /** @figmaProp State = true→"Read only" */
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
        formHelperText?: { sx?: unknown; className?: string; hideErrorIcon?: boolean }
    }
    /** Legacy MUI adornment slot (still used by ~22 call sites). */
    InputProps?: InputSlot
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
    /** Forwarded to the field root (MUI `TextField` parity); e.g. to stop clicks bubbling to a sortable header. */
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
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
    maxRows,
    size = 'medium',
    fullWidth,
    className,
    style,
    sx,
    inputRef,
    slotProps,
    InputProps,
    onKeyDown,
    onClick,
    variant: _variant,
}: StyledInputFieldProps): JSX.Element => {
    const generatedId = useId()
    const fieldId = id ?? generatedId
    const helperId = `${fieldId}-helper-text`
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    // Measures a custom end adornment (e.g. the autocomplete's clear + chevron) so the single-line
    // input can reserve exactly enough right padding — the fixed `data-end-adornment` 40px only fits
    // one icon, so wider adornments let long values scroll underneath them (ASMA select overflow).
    const endAdornmentRef = useRef<HTMLSpanElement | null>(null)
    const [endAdornmentPad, setEndAdornmentPad] = useState<number | undefined>(undefined)
    const [focused, setFocused] = useState(false)
    const [hasValueUncontrolled, setHasValueUncontrolled] = useState(
        defaultValue != null && defaultValue !== '',
    )

    const isControlled = value !== undefined
    const hasValue = isControlled ? value !== '' && value != null : hasValueUncontrolled
    const disabledOrReadonly = Boolean(disabled) || Boolean(readOnly)

    const startAdornment = slotProps?.input?.startAdornment ?? InputProps?.startAdornment
    const hasStartAdornment = Children.count(startAdornment) > 0
    const isAdornmentList = hasStartAdornment && Array.isArray(startAdornment)
    const userEndAdornment = slotProps?.input?.endAdornment ?? InputProps?.endAdornment
    const showClear = Boolean(allowClear && hasValue && !disabledOrReadonly)

    // The MUI input slot lets callers pass their own ref via `slotProps.htmlInput.ref` (Autocomplete
    // does this); prefer an explicit `inputRef`, else fall back to it.
    const { ref: htmlInputRef, ...htmlInputRest } = slotProps?.htmlInput ?? {}
    const resolvedRef = (inputRef ?? htmlInputRef) as Ref<HTMLInputElement & HTMLTextAreaElement>
    const { className: inputSlotClass, style: inputSlotStyle, ref: inputSlotRef } = slotProps?.input ?? {}
    const mergedInputSlotRef = useMergeRefs([inputSlotRef])
    const inputSlotOnMouseDown = slotProps?.input?.['onMouseDown'] as
        | React.MouseEventHandler<HTMLDivElement>
        | undefined

    const shrink = focused || hasValue || hasStartAdornment

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
        if (readOnly) return
        if (!isControlled) setHasValueUncontrolled(event.target.value !== '')
        onChange?.(event)
    }
    const handleFocus = (event: FocusEvent<HTMLInputElement>): void => {
        // Read-only/disabled fields must not enter the focused state — otherwise clicking a read-only
        // field triggers the focus border + label-float animation, which is wrong for a non-editable field.
        if (!disabled && !readOnly) setFocused(true)
        onFocus?.(event)
    }
    const handleBlur = (event: FocusEvent<HTMLInputElement>): void => {
        if (!disabled && !readOnly) setFocused(false)
        onBlur?.(event)
    }

    useLayoutEffect(() => {
        const node = textareaRef.current
        if (!multiline || rows != null || !node) return

        node.style.height = 'auto'
        const computed = getComputedStyle(node)
        const lineHeight = Number.parseFloat(computed.lineHeight) || 24
        const verticalPadding = Number.parseFloat(computed.paddingTop) + Number.parseFloat(computed.paddingBottom)
        const minHeight = minRows ? minRows * lineHeight + verticalPadding : 0
        const maxHeight = maxRows ? maxRows * lineHeight + verticalPadding : Number.POSITIVE_INFINITY
        node.style.height = `${Math.min(maxHeight, Math.max(minHeight, node.scrollHeight))}px`
    }, [defaultValue, maxRows, minRows, multiline, rows, value])

    // Capture the textarea node (for the auto-resize effect) via a stable ref callback, then let
    // `useMergeRefs` forward to the caller's ref. Merging (vs. hand-mutating `resolvedRef`) keeps the
    // forwarded ref stable and satisfies the react-compiler no-mutate-after-render rule.
    const captureTextarea = useCallback((node: HTMLInputElement | HTMLTextAreaElement | null): void => {
        textareaRef.current = node instanceof HTMLTextAreaElement ? node : null
    }, [])
    const assignRef = useMergeRefs([resolvedRef, captureTextarea])

    const { style: htmlInputStyle, ...htmlInputPropsWithoutStyle } = htmlInputRest
    const isSingleLineShell = !multiline && !isAdornmentList
    const shellStyle: CSSProperties | undefined = isSingleLineShell
                ? { boxSizing: 'border-box', height: 40, minHeight: 40, maxHeight: 40, ...inputSlotStyle }
        : isAdornmentList
                    ? { boxSizing: 'border-box', minHeight: 40, ...inputSlotStyle }
          : inputSlotStyle
    const singleLineHtmlInputStyle: CSSProperties | undefined = isSingleLineShell
        ? {
              ...htmlInputStyle,
              height: undefined,
              minHeight: undefined,
              maxHeight: undefined,
              // Reserve room for a measured custom end adornment so the value truncates/scrolls before
              // it instead of underneath (fixed `data-end-adornment` 40px only clears a single icon).
              ...(endAdornmentPad != null ? { paddingRight: endAdornmentPad } : {}),
          }
        : htmlInputStyle

    useLayoutEffect(() => {
        // `endAdornmentPad` is only ever READ at its one call site above, itself gated on
        // `isSingleLineShell` (`singleLineHtmlInputStyle`, used only when `isSingleLineShell`) — so
        // there's nothing to reset when it flips false; skip the measurement rather than clear stale
        // state that's already unreachable. Avoids a setState call in the effect body for that branch.
        if (!isSingleLineShell) return
        const el = endAdornmentRef.current
        // width of the adornment + its 14px right inset + a small gap.
        const next = el ? Math.ceil(el.getBoundingClientRect().width) + 20 : undefined
        setEndAdornmentPad((prev) => (prev === next ? prev : next))
    })
    // With a label the resting (un-shrunk) label sits in the placeholder position, so the HTML
    // placeholder must stay hidden until the label floats up (`shrink`) — otherwise the two texts
    // overlap. With no label there is nothing to overlap, so the placeholder should show at rest like
    // a plain input. Gating purely on `shrink` wrongly hid the placeholder for label-less fields.
    const showPlaceholder = shrink || !label

    const sharedProps = {
        ...htmlInputPropsWithoutStyle,
        style: isSingleLineShell ? singleLineHtmlInputStyle : htmlInputStyle,
        name,
        placeholder: showPlaceholder ? placeholder : undefined,
        disabled,
        readOnly,
        required,
        autoComplete,
        autoFocus,
        value,
        defaultValue,
        'aria-invalid': error ? true : undefined,
        // The visible label lives in the aria-hidden notch `<legend>` (decorative), so associate it
        // with the control via `aria-label` for a real accessible name (and `getByLabelText`). An
        // explicit `aria-label`/`aria-labelledby` on `htmlInput` (e.g. Autocomplete) still wins.
        'aria-label':
            htmlInputRest['aria-label'] ??
            (htmlInputRest['aria-labelledby'] ? undefined : typeof label === 'string' && label !== '' ? label : undefined),
        'aria-describedby':
            !readOnly && (helperText != null || error) ? helperId : htmlInputRest['aria-describedby'],
        onChange: handleChange,
        onFocus: handleFocus,
        onBlur: handleBlur,
        onKeyDown:
            htmlInputRest.onKeyDown || onKeyDown
                ? (event: React.KeyboardEvent<HTMLInputElement>) => {
                      onKeyDown?.(event)
                      if (!event.defaultPrevented) htmlInputRest.onKeyDown?.(event)
                  }
                : undefined,
    }

    const inputClasses = cn(
        styles['Input'],
        'peer border-0 bg-transparent text-base tracking-[0.00938em] text-delta-800 outline-none placeholder:text-delta-500', // Figma field text delta/800 #363e4a
        isAdornmentList
            ? 'box-border h-8 min-w-[60px] flex-1 py-0 pl-0 pr-0 leading-[23px]'
            : multiline
              ? 'w-full resize-none overflow-hidden p-0 pl-0 pr-0 leading-[23px]'
              : cn('w-full', styles['Input--singleLine']),
        'disabled:text-delta-300',
        // Read-only fill lives on the shell (below) so it covers the whole box incl. the multiline
        // padding; keep the field itself transparent to avoid a `bg-transparent`/`bg-delta-50` clash
        // (cn here is plain clsx, no tailwind-merge, so a competing bg is order-dependent/flaky).
        readOnly && 'text-delta-800',
        inputSlotClass,
    )
    const singleLineDataProps =
        !multiline && !isAdornmentList
            ? {
                  'data-start-adornment': hasStartAdornment ? 'true' : undefined,
                  'data-end-adornment': showClear || userEndAdornment ? 'true' : undefined,
              }
            : {}
    return (
        // Not independently interactive, same rationale as StyledFormControl: this wraps the REAL
        // <input>/<textarea> below, already keyboard-operable on its own. `onClick` here is a
        // documented passthrough (MUI TextField parity, e.g. stop clicks bubbling to a sortable
        // header) — not a control needing its own tabIndex.
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
            className={cn('group relative inline-flex flex-col', className)}
            onClick={onClick}
            style={{
                width: fullWidth ? '100%' : 235,
                fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
                letterSpacing: '0.00938em',
                ...resolveSx(sx),
                ...style,
            }}
        >
            <div className='relative overflow-visible'>
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- not independently
                    interactive: this shell wraps the REAL <input>/<textarea> below, which is already
                    keyboard-operable on its own. `onMouseDown` is a passthrough (MUI-parity
                    `slotProps.input.onMouseDown`) for mouse-specific shell behaviour, same as
                    StyledFormControl's focus/blur bubbling — not a control needing its own tabIndex. */}
                <div
                    className={cn(
                        'relative flex',
                        isSingleLineShell && styles['InputShell'],
                        multiline && 'box-border items-center px-[14px] py-[16.5px]',
                        isAdornmentList &&
                            cn(
                                styles['AdornmentList'],
                                userEndAdornment && styles['AdornmentList--endAdornment'],
                            ),
                        // Read-only surface: fill the whole box (matches the delta-200 border, radius 4).
                        // On the shell (not the input) so it also covers the multiline field's padding.
                        readOnly && 'rounded bg-delta-50',
                    )}
                    ref={mergedInputSlotRef}
                    onMouseDown={inputSlotOnMouseDown}
                    style={shellStyle}
                    data-testid={isAdornmentList ? `${dataTest}-adornment-list` : `${dataTest}-shell`}
                >
                    {hasStartAdornment && (
                        <span
                            className={cn(
                                'items-center text-delta-500',
                                // `flex` must live only in the non-adornment branch: pairing it with
                                // `contents` puts two `display` utilities on one element, and when a
                                // consumer's Tailwind marks utilities `!important` (or orders `flex`
                                // after `contents`), `flex` wins — the wrapper never dissolves and the
                                // chip adornment list can't flex-wrap. See [[ui-core-adornment-contents-flex-conflict]].
                                isAdornmentList ? 'contents' : 'absolute left-3 flex',
                            )}
                        >
                            {startAdornment}
                        </span>
                    )}
                    {multiline ? (
                        <textarea
                            {...(sharedProps as unknown as TextareaHTMLAttributes<HTMLTextAreaElement>)}
                            ref={assignRef}
                            data-testid={dataTest}
                            rows={rows ?? minRows ?? 2}
                            className={inputClasses}
                        />
                    ) : (
                        <input
                            {...(sharedProps)}
                            {...singleLineDataProps}
                            ref={assignRef}
                            data-testid={dataTest}
                            type={type}
                            className={inputClasses}
                        />
                    )}

                    {showClear ? (
                        // Native <button>: keyboard-operable (Tab/Enter/Space) and has a role for free —
                        // a `<div role='button'>` here had no tabIndex/keydown handler and was unreachable
                        // by keyboard. `aria-label` is required since the only content is an icon.
                        <button
                            type='button'
                            aria-label='Clear'
                            data-testid={`${dataTest}-clear`}
                            className='absolute right-4 z-40 flex items-center justify-center rounded-full border-0 bg-transparent p-[2px] duration-300 hover:bg-gama-100'
                            onClick={(event) => {
                                event.stopPropagation()
                                event.preventDefault()
                                if (!isControlled) setHasValueUncontrolled(false)
                                onClear?.()
                            }}
                        >
                            <CloseIcon width={18} height={18} />
                        </button>
                    ) : (
                        userEndAdornment && (
                            // `inset-y-0 items-center` keeps the indicator vertically centred in the field
                            // even after the chip adornment list grows to multiple rows (Figma icon-right).
                            <span
                                ref={endAdornmentRef}
                                className='absolute inset-y-0 right-[14px] flex max-w-[calc(100%-28px)] items-center gap-1'
                            >
                                {userEndAdornment}
                            </span>
                        )
                    )}

                    {label ? (
                        <fieldset
                            aria-hidden
                            className={notchedOutlineClass({ focused, error, disabled, readOnly, notched: true })}
                        >
                            <legend className={notchedLegendClass(shrink)}>
                                <span className='inline-block px-[5px]'>
                                    {label}
                                    {required && ' *'}
                                </span>
                            </legend>
                        </fieldset>
                    ) : (
                        <div
                            aria-hidden
                            className={notchedOutlineClass({ focused, error, disabled, readOnly, notched: false })}
                        />
                    )}
                </div>

                {label && (
                    <label
                        htmlFor={fieldId}
                        className={cn(
                            floatingLabelClass({ shrink, focused, error, disabled, readOnly, size }),
                            slotProps?.inputLabel?.className,
                        )}
                        style={{
                            ...resolveSx(slotProps?.inputLabel?.['sx']),
                            ...slotProps?.inputLabel?.style,
                        }}
                    >
                        {label}
                        {required && ' *'}
                    </label>
                )}
            </div>

            {!readOnly && (helperText != null || error) && (
                <div
                    id={helperId}
                    className={cn(
                        // Figma "Helper text" row (15561-37857 / 34634-148726): 24px tall, pt 4px, gap 4px.
                        !slotProps?.formHelperText &&
                            'mr-[14px] box-border min-h-[24px] pt-1',
                        error &&
                            !slotProps?.formHelperText?.hideErrorIcon &&
                            'flex items-start gap-1 text-error-500',
                        !error && 'text-delta-600',
                        slotProps?.formHelperText?.className,
                    )}
                    style={resolveSx(slotProps?.formHelperText?.sx)}
                >
                    {error && !slotProps?.formHelperText?.hideErrorIcon && (
                        <ErrorOutlineIcon width={20} height={20} className='min-w-5 shrink-0' />
                    )}
                    <span className='text-sm leading-5 tracking-[0.03333em]'>
                        {error ? (helperText ?? 'Required') : helperText}
                    </span>
                </div>
            )}
        </div>
    )
}
