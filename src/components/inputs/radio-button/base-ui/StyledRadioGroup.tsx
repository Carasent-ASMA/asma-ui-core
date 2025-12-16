import React, { forwardRef } from 'react'
import { RadioGroup } from '@base-ui-components/react/radio-group'

type StyledRadioGroupProps = {
    value?: string | number | boolean | null
    defaultValue?: string | number | boolean | null
    onValueChange?: (value: string | number | boolean | null) => void
    disabled?: boolean
    dataTest?: string
    children: React.ReactNode
} & Omit<React.ComponentProps<typeof RadioGroup>, 'children' | 'defaultValue' | 'value'>

export const StyledRadioGroup = forwardRef<HTMLDivElement, StyledRadioGroupProps>(
    ({ value, defaultValue, onValueChange, name, id, dataTest, children, ...rest }, ref) => {
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
            </RadioGroup>
        )
    },
)
