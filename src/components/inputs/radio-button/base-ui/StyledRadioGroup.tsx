import React, { forwardRef } from 'react'
import { RadioGroup } from '@base-ui-components/react/radio-group'
import styles from './styledradiogroup.module.scss'

type StyledRadioGroupProps = {
    value?: string | number | boolean
    defaultValue?: string | number | boolean
    onValueChange?: (value: string | number | boolean) => void
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
