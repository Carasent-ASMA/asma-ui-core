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
import { forwardRef } from 'react'
import clsx from 'clsx'

import styles from './StyledInputField.module.scss'

type StyledInputFieldProps = InputBaseProps & {
    /**
     * The helper text to display below the input field.
     */
    helperText?: string
    /**
     * The label to display above the input field.
     */
    label?: string
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
        className,
        disabled = false,
        error = false,
        FormControlProps,
        FormHelperTextProps,
        fullWidth = false,
        helperText,
        id: idOverride,
        InputLabelProps,
        label,
        required = false,
        ...other
    } = props

    const id = useId(idOverride)
    const helperTextId = helperText && id ? `${id}-helper-text` : undefined
    const inputLabelId = label && id ? `${id}-label` : undefined

    return (
        <FormControl
            {...FormControlProps}
            className={className}
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
                        root: clsx(
                            'text-sm font-semibold',
                            disabled ? 'text-delta-300' : error ? 'text-error-700' : 'text-delta-800',
                            InputLabelProps?.classes?.root,
                        ),
                        ...InputLabelProps?.classes,
                        // The following classes are currently not working:
                        // error: clsx('text-error-700', InputLabelProps?.classes?.error),
                        // disabled: clsx('text-delta-300', InputLabelProps?.classes?.disabled),
                    }}
                    shrink={InputLabelProps?.shrink ?? true}
                >
                    {label}
                </InputLabel>
            )}

            <InputBase
                classes={{
                    root: clsx(styles['root'], other.classes?.root),
                    disabled: clsx('border-delta-300 text-delta-300', other.classes?.disabled),
                    error: clsx('bg-error-100 border-error-700 text-error-700', other.classes?.error),
                    input: clsx(
                        'px-2 placeholder:opacity-100',
                        disabled
                            ? 'placeholder:text-delta-300'
                            : error
                            ? 'placeholder:text-error-700'
                            : 'placeholder:text-delta-500',
                        other.classes?.input,
                    ),
                    readOnly: clsx('bg-delta-50 border-none', other.classes?.readOnly),
                    inputSizeSmall: clsx('pt-1.5', other.classes?.inputSizeSmall),
                    sizeSmall: clsx('h-8', other.classes?.sizeSmall),
                    ...other.classes,
                }}
                sx={{
                    'label + &': {
                        marginTop: '1rem',
                    },
                    ...other.sx,
                }}
                id={id}
                aria-describedby={helperTextId}
                fullWidth={fullWidth}
                {...other}
            />

            {helperText && (
                <FormHelperText
                    {...FormHelperTextProps}
                    id={helperTextId}
                    classes={{
                        root: clsx(
                            'text-xs mt-1',
                            disabled ? 'text-delta-300' : error ? 'text-error-700' : 'text-delta-600',
                            FormHelperTextProps?.classes?.root,
                        ),
                        ...FormHelperTextProps?.classes,
                        // The following classes are currently not working:
                        // error: clsx('text-error-700', FormHelperTextProps?.classes?.error),
                        // disabled: clsx('text-delta-300', FormHelperTextProps?.classes?.disabled),
                    }}
                >
                    {helperText}
                </FormHelperText>
            )}
        </FormControl>
    )
})
