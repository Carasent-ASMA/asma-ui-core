import type { AutocompleteProps } from '@mui/material'
import type React from 'react'

export type DynamicSelectOptionPrimitive = string | number | boolean

export type DynamicSelectOptionObject = {
    value?: string | number
    label?: string
    disabled?: boolean
} & object
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
    /** Unique identifier used as the root `data-test` attribute for QA selectors. */
    dataTest: string
    /** The full list of selectable options. Determines which UI is rendered: 1–5 → chip group, 0 or 6+ → autocomplete. */
    options: TOption[]
    /** When `true`, the component is non-interactive and only shows selected value(s) as plain chip(s). */
    readOnly?: boolean
    /** Prevents the built-in clear button from appearing even when a value is set. Applies to autocomplete only. */
    disableClearable?: boolean
    /** Optional label rendered above the input/chip group. */
    title?: string
    /** Controls the visual size of chips and buttons. Defaults to `'medium'`. */
    size?: 'small' | 'medium'
    /** Placeholder text shown in the autocomplete input when no value is selected. */
    placeholder?: string
    /** Disables all interactions. */
    disabled?: boolean
    /** Text shown in the autocomplete dropdown when no options match the search query. */
    noOptionsText?: string
    /** When `true`, shows the error style and renders an error icon next to the helper text. */
    error?: boolean
    /**
     * When `true`, hides the "Clear selection" button in the chip group.
     * Use this when the field must always have a value.
     */
    required?: boolean
    /** Supplementary text rendered below the input. Shown as-is, or falls back to `'Required'` when `error=true` and no text is provided. */
    helperText?: React.ReactNode
    /** Completely removes the helper text block below the autocomplete */
    disableHelperText?: boolean
    /**
     * Key of `TOption` used as the option's identity for comparison and as the chip/tag key.
     * Defaults to `'value'`. Only applicable when `TOption` is an object.
     */
    valueKey?: TOption extends object ? keyof TOption : never
    /**
     * Key of `TOption` used as the displayed label string.
     * Defaults to `'label'`. Only applicable when `TOption` is an object.
     */
    labelKey?: TOption extends object ? keyof TOption : never
    /**
     * Custom label renderer. When provided, its return value is used instead of the
     * plain string resolved from `labelKey`. Useful for rich content (icons, avatars, etc.).
     */
    renderLabel?: (option: TOption) => React.ReactNode
    /**
     * Returns a tooltip node shown when hovering a specific option.
     * Return `null` to show no tooltip for that option.
     */
    getOptionTooltip?: (option: TOption) => React.ReactNode
    /** Node prepended inside the autocomplete text input (e.g. a search icon). */
    startAdornment?: React.ReactNode
    /** Escape hatch to pass any MUI `Autocomplete` prop directly. Applied on top of internal defaults in the autocomplete variant. */
    autocompleteProps?: Partial<
        AutocompleteProps<TOption, boolean | undefined, boolean | undefined, boolean | undefined>
    >
    /**
     * When `true`, renders loading skeletons (chip group) or disables the input (autocomplete)
     * while data is being fetched.
     */
    loading?: boolean
    /**
     * Limits how many selected-value chips are visible in the autocomplete's input area.
     * Remaining selections are summarised as `+N`. Has no effect on the chip group variant.
     */
    maxTags?: number
    /**
     * Controls locale-sensitive labels and messages used by the component.
     * Use `'no'` for Norwegian and `'en'` for English.
     *
     * Intended for consumer-facing text such as clear actions, helper copy,
     * or empty-state messaging when localized behavior is supported.
     */
    locale?: 'no' | 'en'
}

export type StyledDynamicSelectProps<TOption extends DynamicSelectOption> = DynamicSelectCommonProps<TOption> &
    (SingleDynamicSelectProps<TOption> | MultipleDynamicSelectProps<TOption>)

export type StyledDynamicSelectComponent = <TOption extends DynamicSelectOption>(
    props: StyledDynamicSelectProps<TOption> & React.RefAttributes<HTMLInputElement>,
) => React.ReactElement | null
