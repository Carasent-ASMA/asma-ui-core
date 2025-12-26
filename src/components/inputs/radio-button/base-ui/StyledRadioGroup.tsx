import React, { forwardRef } from 'react'
import { RadioGroup } from '@base-ui-components/react/radio-group'
import { StyledFormHelperText } from 'src'
import { ErrorOutlineIcon } from 'asma-ui-icons'
import clsx from 'clsx'

type StyledRadioGroupProps = {
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
    (
        { value, defaultValue, onValueChange, name, id, dataTest, error, errorText, helperText, children, ...rest },
        ref,
    ) => {
        const showHelperText = (error ?? false) || (helperText ?? false)
        const helperTextToDisplay = error ? errorText ?? 'Required' : helperText

        return (
            <RadioGroup
                {...rest}
                ref={ref}
                value={value}
                defaultValue={defaultValue}
                data-test={dataTest}
                onValueChange={onValueChange}
            >
                {children}

                {showHelperText && (
                    <StyledFormHelperText
                        className={clsx(
                            'flex items-center gap-1 m-0 pt-1 text-sm',
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
