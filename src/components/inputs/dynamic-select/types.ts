import type { StyledSelectAutocompleteProps } from '../select-autocomplete'
import type React from 'react'

export type DynamicSelectOptionPrimitive = string | number | boolean

export type DynamicSelectOptionObject = {
    value?: string | number
    label?: string
    disabled?: boolean
} & object
export type DynamicSelectOption = DynamicSelectOptionPrimitive | (DynamicSelectOptionObject & object)

interface SingleDynamicSelectProps<TOption extends DynamicSelectOption> {
    /** @figmaProp Selection mode = "Single select" row (radio chips / single-value field). */
    multiple?: false
    /** @figmaProp Filled — the single selected option (fills the field / checks the chip). */
    value: TOption | null
    onChange: (value: TOption | null) => void
}

interface MultipleDynamicSelectProps<TOption extends DynamicSelectOption> {
    /** @figmaProp Selection mode = "Multiple select" row (checkbox chips / tag chips + `+`). */
    multiple: true
    /** @figmaProp Filled — selected options (tag chips in the field / checked chips). */
    value: TOption[] | null
    onChange: (value: TOption[] | null) => void
}

interface DynamicSelectCommonProps<TOption extends DynamicSelectOption> {
    /** @figmaProp none — test hook */
    dataTest: string
    /** @figmaProp option-count column — 1–5 → Chips select, 6–10 → Select (dropdown), 11+ → Autocomplete. */
    options: TOption[]
    /** @figmaProp State = true→"Read-only" (non-interactive; selected value(s) shown as plain chips). */
    readOnly?: boolean
    /** Prevents the built-in clear button from appearing even when a value is set. Applies to autocomplete only. */
    disableClearable?: boolean
    /** @figmaProp Title (Body Base SemiBold 16, text-icon/title-label delta-800) above the control. */
    title?: string
    /** @figmaProp none — app size (chips/buttons). Defaults to `'medium'`. */
    size?: 'small' | 'medium'
    /** Placeholder text shown in the autocomplete input when no value is selected. */
    placeholder?: string
    /** @figmaProp State = true→"Disabled" */
    disabled?: boolean
    /** @figmaProp Empty-state text in the dropdown when no options match the search. */
    noOptionsText?: string
    /** @figmaProp State = true→"Error" (error border/icon + red helper row). */
    error?: boolean
    /**
     * @figmaProp Required — hides the chip-group "Clear selection" link (must keep a value).
     * Use this when the field must always have a value.
     */
    required?: boolean
    /** @figmaProp Helper text (Helper 14/lh20; falls back to "Required" when `error` and no text). */
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
     * @figmaProp Complex label — rich option content (the Figma "Complex … with long labels and
     * helper text" rows: title + description, avatars, icons). Overrides the `labelKey` string.
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
        StyledSelectAutocompleteProps<TOption, boolean | undefined, boolean | undefined, boolean | undefined>
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
