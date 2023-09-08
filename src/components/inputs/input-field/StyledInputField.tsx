import {
    FormControl,
    type FormControlProps,
    InputLabel,
    FormHelperText,
    unstable_useId as useId,
    InputBase,
    type FormHelperTextProps,
    type InputLabelProps,
    type InputBaseProps,
} from '@mui/material'
import { forwardRef, useState, type ReactNode } from 'react'
import clsx from 'clsx'

import styles from './StyledInputField.module.scss'

type StyledInputFieldProps = InputBaseProps & {
    /**
     * The maximum number of characters allowed in the input field.
     */
    characterLimit?: number
    /**
     * If `true`, a character counter will be displayed inside the input field (multiline).
     */
    counter?: boolean
    /**
     * The description message to display between the textarea and its label.
     */
    descriptionMessage?: string
    /**
     * The helper text to display below the input field.
     */
    helperText?: ReactNode
    /**
     * The label to display above the input field.
     */
    label?: string
    /**
     * For numeric input fields, pass `inputProps={{inputMode: 'numeric', pattern: '[0-9]*'}}` to validate numbers.
     */
    value?: string
    /**
     * Props applied to the internal FormHelperText used for the description message.
     */
    DescriptionMessageProps?: FormHelperTextProps
    /**
     * Props applied to the [`FormControl`](https://mui.com/material-ui/api/form-control/) element.
     */
    FormControlProps?: FormControlProps
    /**
     * Props applied to the [`FormHelperText`](https://mui.com/material-ui/api/form-helper-text/) element.
     */
    FormHelperTextProps?: FormHelperTextProps
    /**
     * Props applied to the [`InputLabel`](https://mui.com/material-ui/api/input-label/) element.
     * Pointer events like `onClick` are enabled if and only if `shrink` is `true`.
     */
    InputLabelProps?: InputLabelProps
}

/**
 * A customizable input field that is built on top of the InputBase component from Material-UI.
 */
export const StyledInputField = forwardRef<HTMLDivElement, StyledInputFieldProps>((props, ref) => {
    const {
        characterLimit,
        className,
        counter = false,
        descriptionMessage,
        DescriptionMessageProps,
        disabled = false,
        error = false,
        FormControlProps,
        FormHelperTextProps,
        fullWidth = false,
        helperText,
        id: idOverride,
        InputLabelProps,
        label,
        multiline = false,
        onChange,
        required = false,
        size = 'medium',
        value,
        ...other
    } = props

    const id = useId(idOverride)
    const descriptionMessageId = descriptionMessage && id ? `${id}-description-message` : undefined
    const helperTextId = helperText && id ? `${id}-helper-text` : undefined
    const inputLabelId = label && id ? `${id}-label` : undefined

    const [characterCount, setCharacterCount] = useState<number>(value?.length ?? 0)

    let helperTextPositionClass = ''

    switch (true) {
        case multiline:
            helperTextPositionClass = 'absolute bottom-0 right-1 pr-2 pb-3'
            break
        case label && size !== 'small':
            helperTextPositionClass = 'top-14'
            break
        case label && size === 'small':
            helperTextPositionClass = 'top-12'
            break
        case size === 'small':
            helperTextPositionClass = 'top-8'
            break
        default:
            helperTextPositionClass = 'top-10'
            break
    }

    return (
        <FormControl
            {...FormControlProps}
            className={clsx(className, multiline && 'w-[400px]')}
            disabled={disabled}
            error={error}
            fullWidth={fullWidth}
            ref={ref}
            required={required}
            variant='standard'
        >
            {label != null && label !== '' && (
                <InputLabel
                    {...InputLabelProps}
                    htmlFor={id}
                    id={inputLabelId}
                    classes={{
                        ...InputLabelProps?.classes,
                        root: clsx(
                            'text-sm font-semibold scale-100 -translate-y-2',
                            disabled ? 'text-delta-300' : error ? 'text-error-700' : 'text-delta-800',
                            InputLabelProps?.classes?.root,
                        ),
                        // TODO Find a way to make the following classes work:
                        // error: clsx('text-error-700', InputLabelProps?.classes?.error),
                        // disabled: clsx('text-delta-300', InputLabelProps?.classes?.disabled),
                    }}
                    shrink={InputLabelProps?.shrink ?? true}
                >
                    {label}
                </InputLabel>
            )}

            {multiline && descriptionMessage && (
                <FormHelperText
                    {...DescriptionMessageProps}
                    id={descriptionMessageId}
                    classes={{
                        ...DescriptionMessageProps?.classes,
                        root: clsx(
                            'text-xs mt-3.5 mb-1',
                            disabled ? 'text-delta-300' : error ? 'text-error-700' : 'text-delta-600',
                            DescriptionMessageProps?.classes?.root,
                        ),
                    }}
                >
                    {descriptionMessage}
                </FormHelperText>
            )}

            <InputBase
                classes={{
                    ...other.classes,
                    root: clsx(styles['root'], other.classes?.root),
                    multiline: clsx('max-w-[400px] min-h-[64px] h-full p-3', other.classes?.multiline),
                    disabled: clsx('border-delta-300 text-delta-300', multiline && 'border-2', other.classes?.disabled),
                    error: clsx(
                        'bg-error-100 border-error-700 text-error-700',
                        multiline && 'border-2',
                        other.classes?.error,
                    ),
                    input: clsx(
                        'px-2 text-sm placeholder:opacity-100',
                        disabled
                            ? 'placeholder:text-delta-300'
                            : error
                            ? 'placeholder:text-error-700'
                            : 'placeholder:text-delta-500',
                        other.classes?.input,
                    ),
                    inputMultiline: clsx('p-0 pb-3', other.classes?.inputMultiline),
                    focused: clsx('border-2 border-warning-500', other.classes?.focused),
                    readOnly: clsx(
                        'bg-delta-50 border-none',
                        multiline ? 'text-delta-700' : ' text-delta-800',
                        other.classes?.readOnly,
                    ),
                    inputSizeSmall: clsx('pt-1.5', other.classes?.inputSizeSmall),
                    sizeSmall: clsx('h-8', other.classes?.sizeSmall),
                }}
                sx={{
                    ...other.sx,
                    'label + &': {
                        marginTop: '1rem',
                    },
                }}
                id={id}
                aria-describedby={helperTextId}
                fullWidth={fullWidth}
                multiline={multiline}
                size={size}
                value={value}
                onChange={(event) => {
                    const newValueLength = event.target.value.length

                    if (counter && characterLimit) {
                        if (newValueLength > characterLimit) return
                        onChange?.(event)
                        setCharacterCount(newValueLength)
                    } else {
                        if (characterLimit && newValueLength > characterLimit) return
                        onChange?.(event)
                    }
                }}
                {...other}
            />

            {(helperText || (multiline && counter)) && (
                <FormHelperText
                    {...FormHelperTextProps}
                    id={helperTextId}
                    classes={{
                        ...FormHelperTextProps?.classes,
                        root: clsx(
                            'text-xs mt-1 absolute',
                            helperTextPositionClass,
                            disabled
                                ? 'text-delta-300'
                                : error
                                ? 'text-error-700'
                                : multiline
                                ? 'text-delta-800'
                                : 'text-delta-600',
                            FormHelperTextProps?.classes?.root,
                        ),
                        // TODO Find a way to make the following classes work:
                        // error: clsx('text-error-700', FormHelperTextProps?.classes?.error),
                        // disabled: clsx('text-delta-300', FormHelperTextProps?.classes?.disabled),
                    }}
                >
                    {multiline && counter ? `${characterCount}/${characterLimit}` : helperText}
                </FormHelperText>
            )}
        </FormControl>
    )
})
