import * as React from 'react'
import { Field } from '@base-ui-components/react/field'
import clsx from 'clsx'
import styles from './StyledInputField.module.scss'
import { Icon } from '@iconify/react'
import type { StyledInputFieldProps } from './helpers/types'
import {
    composeRefs,
    createSyntheticChangeEvent,
    getInitialFilled,
    normalizeValue,
    useTextareaAutosize,
} from './helpers/helpers'

export const StyledInputField = ({
    dataTest,
    size = 'large',
    className,
    name,
    error = false,
    helperText,
    value,
    defaultValue,
    id,
    type = 'text',
    onChange,
    onBlur,
    onFocus,
    onClear,
    onClick,
    allowClear,
    inputProps,
    multiline = false,
    minRows = 1,
    maxRows,
    InputProps,
    FormHelperTextProps,
    variant = 'outlined',
    placeholder,
    autoComplete,
    autoFocus = false,
    scrollable = false,
    label,
    disabled = false,
    readOnly = false,
    required = false,
    inputRef,
    sx,
    style,
    fullWidth = true,
    onKeyDown,
    searchInput = false,
}: StyledInputFieldProps) => {
    const normalizedValue = normalizeValue(value)
    const normalizedDefaultValue = normalizeValue(defaultValue)

    const inputElRef = React.useRef<HTMLInputElement | null>(null)
    const textareaElRef = React.useRef<HTMLTextAreaElement | null>(null)
    const startAdornmentRef = React.useRef<HTMLDivElement | null>(null)

    const [focused, setFocused] = React.useState(false)
    const [filled, setFilled] = React.useState(() => getInitialFilled(normalizedValue, normalizedDefaultValue))

    // Only sync filled from controlled value; for uncontrolled inputs handleChange manages it
    React.useLayoutEffect(() => {
        if (value !== undefined) {
            setFilled(getInitialFilled(normalizedValue, normalizedDefaultValue))
        }
    }, [value, normalizedValue, normalizedDefaultValue])

    useTextareaAutosize(textareaElRef, multiline && !scrollable, minRows, maxRows, normalizedValue, startAdornmentRef)

    const focusInner = React.useCallback(() => {
        if (disabled || readOnly) return
        const el = multiline ? textareaElRef.current : inputElRef.current
        el?.focus()
    }, [disabled, readOnly, multiline])

    const handleClear = React.useCallback(() => {
        if (onClear) {
            onClear()
        } else {
            onChange?.(createSyntheticChangeEvent(''))
        }
    }, [onClear, onChange])

    const handleContainerMouseDown = React.useCallback<React.MouseEventHandler<HTMLDivElement>>(
        (e) => {
            if (e.button !== 0) return
            const target = e.target as HTMLElement
            if (target.closest(`.${styles['Adornment']}`)) return
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
            e.preventDefault()
            focusInner()
        },
        [focusInner],
    )

    const handleFocus = React.useCallback(
        (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            if (disabled || readOnly) return
            setFocused(true)
            onFocus?.(e)
        },
        [disabled, readOnly, onFocus],
    )

    const handleBlur = React.useCallback(
        (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setFocused(false)
            onBlur?.(e)
        },
        [onBlur],
    )

    const handleChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setFilled(e.currentTarget.value.length > 0)
            onChange?.(e)
        },
        [onChange],
    )
    const shouldAutoFocus = autoFocus && !disabled && !readOnly
    const isInteractive = !disabled && !readOnly

    const containerClass = clsx(
        styles['Container'],
        styles[size],
        styles[variant],
        label && styles['HasLabel'],
        error && styles['Error'],
        disabled && styles['Disabled'],
        readOnly && styles['Readonly'],
        multiline && styles['Multiline'],
        focused && styles['Focused'],
        filled && styles['Filled'],
        InputProps?.startAdornment && styles['HasStartAdornment'],
        (allowClear || InputProps?.endAdornment) && styles['HasEndAdornment'],
        searchInput && styles['SearchInput'],
        InputProps?.className,
    )

    const commonInputProps = {
        ...inputProps,
        ...InputProps?.inputProps,
        value: normalizedValue,
        defaultValue: value === undefined ? normalizedDefaultValue : undefined,
        id,
        type,
        placeholder,
        autoComplete,
        onChange: handleChange,
        onFocus: handleFocus,
        onBlur: handleBlur,
        disabled,
        readOnly,
        required,
        autoFocus: shouldAutoFocus,
        tabIndex: !isInteractive ? -1 : undefined,
        className: clsx(
            styles['Input'],
            multiline && styles['Multiline'],
            scrollable && styles['scrollable'],
            error && styles['Error'],
        ),
        onKeyDown,
    }

    const isCustomComponent = InputProps?.inputComponent !== undefined

    return (
        <Field.Root
            data-test={dataTest}
            name={name}
            invalid={error}
            disabled={disabled}
            className={clsx(styles['FieldRoot'], fullWidth ? styles['FullWidth'] : styles['AutoWidth'], className)}
            style={{ ...sx, ...style }}
        >
            <div
                className={containerClass}
                onMouseDown={handleContainerMouseDown}
                onClick={onClick}
                tabIndex={-1}
                aria-disabled={disabled || undefined}
                style={InputProps?.sx}
            >
                {label && <Field.Label className={styles['srOnly']}>{label}</Field.Label>}

                {InputProps?.startAdornment && (
                    <div ref={startAdornmentRef} className={clsx(styles['Adornment'], styles['Start'])}>
                        {InputProps.startAdornment}
                    </div>
                )}

                <Field.Control
                    render={(controlProps) => {
                        const mergedProps = {
                            ...controlProps,
                            ...commonInputProps,
                            ...(isCustomComponent && { type: undefined }),
                        }

                        const inputRefComposed = composeRefs<HTMLInputElement>(
                            controlProps.ref as React.Ref<HTMLInputElement>,
                            inputRef as unknown as React.Ref<HTMLInputElement>,
                            inputElRef,
                        )

                        const textareaRefComposed = composeRefs<HTMLTextAreaElement>(
                            controlProps.ref as React.Ref<HTMLTextAreaElement>,
                            inputRef as unknown as React.Ref<HTMLTextAreaElement>,
                            textareaElRef,
                        )

                        if (multiline) {
                            return <textarea {...mergedProps} rows={minRows} ref={textareaRefComposed} />
                        }

                        if (isCustomComponent && InputProps?.inputComponent) {
                            const Component = InputProps.inputComponent
                            return <Component {...mergedProps} ref={inputRefComposed} />
                        }

                        return <input {...mergedProps} ref={inputRefComposed} />
                    }}
                />
                {/* outlined variant */}
                {variant === 'outlined' && (
                    <fieldset className={clsx(styles['Outline'], error && styles['ErrorOutline'])}>
                        {label && (
                            <legend className={clsx(styles['Legend'], (focused || filled) && styles['LegendActive'])}>
                                {(focused || filled) && (
                                    <span
                                        className={clsx(
                                            styles['LegendLabel'],
                                            required && styles['LegendLabel--required'],
                                        )}
                                    >
                                        {label}
                                    </span>
                                )}
                            </legend>
                        )}
                    </fieldset>
                )}

                {/* standard underline */}
                {variant === 'standard' && (
                    <span className={styles['Underline']}>
                        <span className={styles['UnderlineHover']} />
                        <span
                            className={clsx(
                                styles['UnderlineActive'],
                                focused && styles['UnderlineFocused'],
                                error && styles['UnderlineError'],
                            )}
                        />
                    </span>
                )}

                {/* floating label */}
                {label && (
                    <label
                        className={clsx(
                            styles['Label'],
                            (focused || filled) && styles['Label--active'],
                            focused && isInteractive && styles['Label--focused'],
                            error && styles['Label--error'],
                        )}
                    >
                        {label}
                        {required && <span className={styles['Asterisk']}>*</span>}
                    </label>
                )}

                {(allowClear || InputProps?.endAdornment) && (
                    <div className={clsx(styles['ActionButtons'], size === 'small' && styles['small'])}>
                        {allowClear && filled && isInteractive && (
                            <button type='button' className={styles['Clear']} aria-label='Clear' onClick={handleClear}>
                                <div className={styles['ClearWrapper']}>
                                    <Icon icon='material-symbols:close-rounded' className={styles['ClearIcon']} />
                                </div>
                            </button>
                        )}
                        {InputProps?.endAdornment && (
                            <div className={styles['EndAdornment']}>{InputProps.endAdornment}</div>
                        )}
                    </div>
                )}
            </div>

            {/* helper text */}
            {helperText && (
                <Field.Description
                    className={clsx(
                        styles['HelperText'],
                        error && styles['HelperTextError'],
                        FormHelperTextProps?.className,
                    )}
                >
                    {helperText}
                </Field.Description>
            )}
        </Field.Root>
    )
}

export type TextFieldProps = StyledInputFieldProps
