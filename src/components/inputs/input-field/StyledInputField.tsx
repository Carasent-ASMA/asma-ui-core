import {
    FormControl,
    type FormControlProps,
    TextField,
    type TextFieldProps,
    InputLabel,
    Input,
    FormHelperText,
    unstable_useId as useId,
    FilledInput,
    OutlinedInput,
    InputBase,
    type FormHelperTextProps,
    type InputLabelProps,
    type InputBaseProps,
} from '@mui/material'
import { forwardRef, type PropsWithChildren } from 'react'
import clsx from 'clsx'
import { Icon } from '@iconify/react'
import { StyledFormLabel } from '../../miscellaneous/StyledFormLabel'

import styles from './StyledInputField.module.scss'

type StyledInputFieldProps = InputBaseProps & {
    helperText?: string
    label?: string
    variant?: 'standard'
    FormControlProps?: FormControlProps
    FormHelperTextProps?: FormHelperTextProps
    InputLabelProps?: InputLabelProps
    // InputBaseProps?: InputBaseProps
}

export const StyledInputField = forwardRef<HTMLDivElement, StyledInputFieldProps>((props, ref) => {
    const {
        autoComplete,
        autoFocus = false,
        className,
        defaultValue,
        disabled = false,
        error = false,
        FormControlProps,
        FormHelperTextProps,
        fullWidth = false,
        helperText,
        id: idOverride,
        InputLabelProps,
        inputProps,
        inputRef,
        label,
        maxRows,
        minRows,
        multiline = false,
        name,
        onBlur,
        onChange,
        onFocus,
        placeholder,
        required = false,
        rows,
        type,
        value,
        variant = 'standard',
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
            variant={variant}
        >
            {label != null && label !== '' && (
                <InputLabel
                    {...InputLabelProps}
                    htmlFor={id}
                    id={inputLabelId}
                    classes={{
                        root: clsx('text-sm text-delta-800 font-semibold'),
                        error: clsx('!text-error-700'),
                        disabled: clsx('!text-delta-300'),
                    }}
                >
                    {label}
                </InputLabel>
            )}

            <InputBase
                classes={{
                    root: clsx(styles.root),
                    disabled: clsx('text-delta-300'),
                    error: clsx('bg-error-100 border-error-700 text-error-700 placeholder:text-error-700'),
                    input: clsx('px-3 placeholder:text-delta-500'),
                    readOnly: clsx('bg-delta-50 border-none'),
                    sizeSmall: clsx('h-8'),
                }}
                sx={{
                    'label + &': {
                        marginTop: '1.5rem',
                    },
                }}
                id={id}
                aria-describedby={helperTextId}
                autoComplete={autoComplete}
                autoFocus={autoFocus}
                defaultValue={defaultValue}
                fullWidth={fullWidth}
                multiline={multiline}
                name={name}
                rows={rows}
                maxRows={maxRows}
                minRows={minRows}
                type={type}
                value={value}
                inputRef={inputRef}
                placeholder={placeholder}
                inputProps={inputProps}
                onBlur={onBlur}
                onChange={onChange}
                onFocus={onFocus}
                {...other}
            />

            {helperText && (
                <FormHelperText
                    {...FormHelperTextProps}
                    id={helperTextId}
                    classes={{
                        root: clsx('text-delta-600'),
                        error: clsx('text-error-700'),
                        disabled: clsx('text-delta-300'),
                    }}
                >
                    {helperText}
                </FormHelperText>
            )}
        </FormControl>
    )
})
