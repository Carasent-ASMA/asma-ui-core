import React, { forwardRef, useId, useMemo, useState, type HTMLAttributes } from 'react'
import { StyledFormHelperText } from 'src'
import { ErrorOutlineIcon } from 'src/components/icons'
import clsx from 'clsx'
import { RadioGroupContext, type RadioValue } from './RadioGroupContext'

export type StyledRadioGroupProps = {
    value?: RadioValue
    defaultValue?: RadioValue
    onValueChange?: (value: RadioValue) => void
    disabled?: boolean
    dataTest?: string
    error?: boolean
    errorText?: string
    helperText?: string
    children: React.ReactNode
    name?: string
} & Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'>

/**
 * Native radio group (replaces `@base-ui/react`): a `role="radiogroup"` container that shares
 * name/selection with its `StyledRadio` children via context, controlled or uncontrolled, plus the
 * error/helper text row. TASK-201.
 */
export const StyledRadioGroup = forwardRef<HTMLDivElement, StyledRadioGroupProps>(
    ({ value, defaultValue, onValueChange, disabled, dataTest, error, errorText, helperText, children, name, ...rest }, ref) => {
        const helperId = useId()
        const errorId = useId()
        const generatedName = useId()
        const groupName = name ?? generatedName

        const isControlled = value !== undefined
        const [uncontrolled, setUncontrolled] = useState<RadioValue>(defaultValue ?? null)
        const selected = isControlled ? value : uncontrolled

        const onSelect = (next: RadioValue) => {
            if (!isControlled) setUncontrolled(next)
            onValueChange?.(next)
        }

        const contextValue = useMemo(
            () => ({ name: groupName, value: selected, disabled, onSelect }),
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [groupName, selected, disabled],
        )

        const showHelperText = (error ?? false) || (helperText ?? false)
        const helperTextToDisplay = error ? errorText ?? 'Required' : helperText
        const describedById = showHelperText ? (error ? errorId : helperId) : undefined

        return (
            <div
                {...rest}
                ref={ref}
                role='radiogroup'
                data-testid={dataTest}
                aria-describedby={describedById}
                aria-invalid={error}
            >
                <RadioGroupContext.Provider value={contextValue}>{children}</RadioGroupContext.Provider>

                {showHelperText && (
                    <StyledFormHelperText
                        id={error ? errorId : helperId}
                        role={error ? 'alert' : 'status'}
                        className={clsx(
                            'm-0 flex items-center gap-1 pt-1 text-sm',
                            error ? 'text-error-500' : 'text-delta-600',
                        )}
                    >
                        {error && <ErrorOutlineIcon width={20} height={20} />}
                        {helperTextToDisplay}
                    </StyledFormHelperText>
                )}
            </div>
        )
    },
)
