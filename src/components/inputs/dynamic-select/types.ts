import type { AutocompleteProps } from '@mui/material'
import type React from 'react'

export type DynamicSelectOptionPrimitive = string | number | boolean

export type DynamicSelectOptionObject = {
    value?: string | number
    label?: string
    disabled?: boolean
} &  object
export type DynamicSelectOption = DynamicSelectOptionPrimitive | (DynamicSelectOptionObject & object)

type SingleDynamicSelectProps<TOption extends DynamicSelectOption> = {
    multiple?: false
    value: TOption | null
    onChange: (value: TOption | null) => void
}

type MultipleDynamicSelectProps<TOption extends DynamicSelectOption> = {
    multiple: true
    value: TOption[] | null
    onChange: (value: TOption[] | null) => void
}

type DynamicSelectCommonProps<TOption extends DynamicSelectOption> = {
    dataTest: string
    options: TOption[]
    readOnly?: boolean
    disableClearable?: boolean
    title?: string
    size?: 'small' | 'medium'
    placeholder?: string
    disabled?: boolean
    noOptionsText?: string
    error?: boolean
    helperText?: React.ReactNode
    valueKey?: TOption extends object ? keyof TOption : never
    labelKey?: TOption extends object ? keyof TOption : never
    renderLabel?: (option: TOption) => React.ReactNode
    getOptionTooltip?: (option: TOption) => React.ReactNode
    startAdornment?: React.ReactNode
    autocompleteProps?: Partial<AutocompleteProps<TOption, boolean | undefined, boolean| undefined, boolean| undefined>>
    loading?: boolean
    maxTags?: number
}

export type StyledDynamicSelectProps<TOption extends DynamicSelectOption> = DynamicSelectCommonProps<TOption> &
    (SingleDynamicSelectProps<TOption> | MultipleDynamicSelectProps<TOption>)

export type StyledDynamicSelectComponent = <TOption extends DynamicSelectOption>(
    props: StyledDynamicSelectProps<TOption> & React.RefAttributes<HTMLInputElement>,
) => React.ReactElement | null
