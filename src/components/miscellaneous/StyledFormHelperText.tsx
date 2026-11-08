import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import { useFormControlContext } from './FormControlContext'

export interface FormHelperTextProps extends Omit<HTMLAttributes<HTMLParagraphElement>, 'children'> {
    children?: ReactNode
    error?: boolean
    disabled?: boolean
}

/**
 * Helper/validation text under a field (replaces MUI `FormHelperText`). Inherits `error`/`disabled`
 * from a surrounding `StyledFormControl` when present, else from props. Public props preserved
 * (DEC-003). TASK-401.
 */
export const StyledFormHelperText = ({
    children,
    error,
    disabled,
    className,
    ...rest
}: FormHelperTextProps): JSX.Element => {
    const ctx = useFormControlContext()
    const isError = error ?? ctx?.error ?? false
    const isDisabled = disabled ?? ctx?.disabled ?? false

    return (
        <p
            className={cn(
                'm-0 min-h-6 text-sm leading-6',
                isError ? 'text-error-500' : isDisabled ? 'text-gray-300' : 'text-delta-600',
                className,
            )}
            {...rest}
        >
            {children}
        </p>
    )
}
