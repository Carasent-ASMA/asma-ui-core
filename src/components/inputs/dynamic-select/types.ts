import type { FieldWidth } from 'src/components/inputs/field-styles'
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
    /**
     * @figmaProp State = true→"Read-only" (non-interactive). Single: the selected label as plain text
     * (`-` when empty), no chip, input or helper row, at any option count. Multiple: the selected
     * values as plain chips.
     */
    readOnly?: boolean
    /** Prevents the built-in clear button from appearing even when a value is set. Applies to autocomplete only. */
    disableClearable?: boolean
    /**
     * @figmaProp Title (text-icon/title-label delta-800) above the control. A node, so a title can carry
     * an icon or a required marker. Prefer it over a separate form label stacked on the select: the
     * select owns the title-to-control gap, which is tighter in read-only (title over plain text).
     */
    title?: React.ReactNode
    /** @figmaProp none — title typography: `'base'` Body Base SemiBold 16/24 (default), `'lg'` Section title 18/28. */
    titleSize?: 'base' | 'lg'
    /** Field width pattern step. The pattern keeps a dynamic select Full (WID-5); Full is the default. */
    width?: FieldWidth
    /** @figmaProp none — app size (chips/buttons). Defaults to `'medium'`. */
    size?: 'small' | 'medium'
    /**
     * Option-row density in the autocomplete dropdown. `'compact'` (default) matches the Figma Menus
     * item at 40px; `'regular'` gives a roomier 48px row. Rows still grow taller when a label wraps.
     * No effect on the chip-group variant (≤5 options).
     */
    rowSize?: 'compact' | 'regular'
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
    helperText?: React.ReactNode
    /**
     * Stops the helper row being *reserved* below the control. A real `helperText` or an `error` still
     * renders it, growing the layout at that moment — so nothing is silently swallowed.
     *
     * On the autocomplete variant it removes the block outright, which is what it has always done
     * there. On the chip-group variant (1–5 options) it opts out of a 28px row that would otherwise
     * sit empty under the chips.
     */
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
    /**
     * Forwarded to the underlying autocomplete text input (autocomplete variant only), so
     * validation/side-effects belong on the field itself instead of a wrapper element — e.g.
     * clear an error `onFocus`, validate `onBlur`. Merged with the field's own focus handling.
     */
    onFocus?: React.FocusEventHandler<HTMLInputElement>
    onBlur?: React.FocusEventHandler<HTMLInputElement>
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
    clearSelectionLabel?: string
}

export type StyledDynamicSelectProps<TOption extends DynamicSelectOption> = DynamicSelectCommonProps<TOption> &
    (SingleDynamicSelectProps<TOption> | MultipleDynamicSelectProps<TOption>)

export type StyledDynamicSelectComponent = <TOption extends DynamicSelectOption>(
    props: StyledDynamicSelectProps<TOption> & React.RefAttributes<HTMLInputElement>,
) => React.ReactElement | null
