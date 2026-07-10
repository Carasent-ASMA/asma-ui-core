import type { ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import { floatingLabelClass, type FieldSize } from '../inputs/field-styles'
import { useFormControlContext } from './FormControlContext'

export interface InputLabelProps {
    children?: ReactNode
    htmlFor?: string
    id?: string
    required?: boolean
    disabled?: boolean
    error?: boolean
    size?: FieldSize
    /** Force the shrunk (floated) state; otherwise derived from the surrounding FormControl. */
    shrink?: boolean
    className?: string
}

/**
 * Floating field label (replaces MUI `InputLabel`). Reads focus/filled/error/size from the
 * surrounding `StyledFormControl`; `shrink` lifts it onto the border. Public props preserved
 * (DEC-003). TASK-401.
 */
export const StyledInputLabel = ({
    children,
    htmlFor,
    id,
    required,
    disabled,
    error,
    size,
    shrink,
    className,
}: InputLabelProps): JSX.Element => {
    const ctx = useFormControlContext()
    const isShrunk = shrink ?? (ctx ? ctx.focused || ctx.filled : false)
    const isRequired = required ?? ctx?.required ?? false

    return (
        <label
            htmlFor={htmlFor}
            id={id ?? ctx?.labelId}
            className={cn(
                floatingLabelClass({
                    shrink: isShrunk,
                    focused: ctx?.focused,
                    error: error ?? ctx?.error,
                    disabled: disabled ?? ctx?.disabled,
                    size: size ?? ctx?.size,
                }),
                className,
            )}
        >
            {children}
            {isRequired && ' *'}
        </label>
    )
}
