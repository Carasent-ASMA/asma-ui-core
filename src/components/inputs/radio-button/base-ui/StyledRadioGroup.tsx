import React, { forwardRef, useId } from 'react'
import { RadioGroup } from '@base-ui/react/radio-group'
import { StyledFormHelperText } from 'src'
import { ErrorOutlineIcon } from 'asma-ui-icons'
import clsx from 'clsx'

export type StyledRadioGroupProps = {
    value?: string | number | boolean | null
    defaultValue?: string | number | boolean | null
    onValueChange?: (value: string | number | boolean | null) => void
    disabled?: boolean
    dataTest?: string
    error?: boolean
    errorText?: string
    helperText?: string
    children: React.ReactNode
} & Omit<React.ComponentProps<typeof RadioGroup>, 'children' | 'defaultValue' | 'value'>

export const StyledRadioGroup = forwardRef<HTMLDivElement, StyledRadioGroupProps>(
    ({ value, defaultValue, onValueChange, dataTest, error, errorText, helperText, children, ...rest }, ref) => {
        const helperId = useId()
        const errorId = useId()

        const showHelperText = (error ?? false) || (helperText ?? false)
        const helperTextToDisplay = error ? errorText ?? 'Required' : helperText
        const describedById = showHelperText ? (error ? errorId : helperId) : undefined

        return (
            <RadioGroup
                {...rest}
                data-testid={dataTest}
                aria-describedby={describedById}
                aria-invalid={error}
                ref={ref}
                value={value}
                defaultValue={defaultValue}
                onValueChange={onValueChange}
            >
                {children}

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
            </RadioGroup>
        )
    },
)
