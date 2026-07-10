import { useId, useMemo, useState, type ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import { resolveSx } from 'src/helpers/sx'
import type { FieldSize } from '../inputs/field-styles'
import { FormControlContext, type FormControlContextValue } from './FormControlContext'

export interface FormControlProps {
    children?: ReactNode
    error?: boolean
    disabled?: boolean
    required?: boolean
    size?: FieldSize
    fullWidth?: boolean
    /** Accepted for API parity; the design always renders outlined. */
    variant?: string
    className?: string
    sx?: unknown
    id?: string
}

/**
 * Form-field context provider + positioned container (replaces MUI `FormControl`). Tracks
 * focus/filled state so `StyledInputLabel` can float and `StyledFormHelperText` can colour itself;
 * `StyledSelect` reports its state into this context. Public props preserved (DEC-003). TASK-401.
 */
export const StyledFormControl = ({
    children,
    error = false,
    disabled = false,
    required = false,
    size = 'medium',
    fullWidth,
    className,
    sx,
    id,
}: FormControlProps): JSX.Element => {
    const generatedId = useId()
    const [focused, setFocused] = useState(false)
    const [filled, setFilled] = useState(false)

    const context = useMemo<FormControlContextValue>(
        () => ({
            focused,
            filled,
            error,
            disabled,
            required,
            size,
            labelId: id ?? generatedId,
            setFocused,
            setFilled,
        }),
        [focused, filled, error, disabled, required, size, id, generatedId],
    )

    return (
        <FormControlContext.Provider value={context}>
            <div
                className={cn('relative inline-flex flex-col', fullWidth && 'w-full', className)}
                style={resolveSx(sx)}
            >
                {children}
            </div>
        </FormControlContext.Provider>
    )
}
