import * as React from 'react'

export type Size = 'small' | 'large'
export type Variant = 'outlined' | 'standard'

export interface StyledInputFieldProps {
    dataTest?: string
    size?: Size
    className?: string
    name?: string
    error?: boolean
    helperText?: React.ReactNode
    value?: string | number | null
    defaultValue?: string | number | null
    id?: string
    type?: React.HTMLInputTypeAttribute
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    onFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    onClear?: () => void
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
    allowClear?: boolean
    inputProps?: React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>
    multiline?: boolean
    minRows?: number
    maxRows?: number
    required?: boolean
    autoFocus?: boolean
    scrollable?: boolean
    InputProps?: {
        endAdornment?: React.ReactNode
        startAdornment?: React.ReactNode
        inputComponent?: React.ComponentType<any>
        className?: string
        sx?: React.CSSProperties
        inputProps?: React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>
    }
    InputLabelProps?: React.LabelHTMLAttributes<HTMLLabelElement> & {
        sx?: React.CSSProperties
    }
    FormHelperTextProps?: React.HTMLAttributes<HTMLDivElement> & {
        sx?: React.CSSProperties
    }
    variant?: Variant
    placeholder?: string
    autoComplete?: string
    label?: string | null
    disabled?: boolean
    readOnly?: boolean
    fullWidth?: boolean
    inputRef?: React.Ref<HTMLInputElement | HTMLTextAreaElement>
    sx?: React.CSSProperties
    style?: React.CSSProperties
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    searchInput?: boolean
}
