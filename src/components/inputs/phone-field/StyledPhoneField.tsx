import { useId, type ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import type { FieldSize } from '../field-styles'
import { StyledInputField } from '../input-field/StyledInputField'
import { CountryCodeSelect } from './CountryCodeSelect'
import type { PhoneCountryChoice, RenderCountryFlag } from './types'

export interface StyledPhoneFieldProps {
    /** @figmaProp none — test hook */
    dataTest: string
    /** @figmaProp Label above the control pair */
    label?: ReactNode
    countries: readonly PhoneCountryChoice[]
    /** Selected country as an ISO 3166-1 alpha-2 code. */
    country: string
    onCountryChange: (iso2: string) => void
    /**
     * National significant number as **digits only** — no dial code, no separators. Grouping is a
     * display concern applied through `formatNationalNumber`, so the value a consumer stores and
     * the value it reads back are the same string.
     */
    value: string
    /** Receives the typed national number as digits only. */
    onChange: (nationalNumber: string) => void
    onBlur?: () => void
    /** @figmaProp State = true→"Error" — reddens the number input only, per Figma. */
    error?: boolean
    /** @figmaProp Helper text element */
    helperText?: ReactNode
    reserveHelperText?: boolean
    /** @figmaProp State = true→"Disabled" */
    disabled?: boolean
    /** @figmaProp State = true→"Read only" — renders the number as text, not as inputs. */
    readOnly?: boolean
    /** Pre-formatted international number for the read-only state, e.g. `'+47 48 01 23 45'`. */
    readOnlyText?: string
    required?: boolean
    /** @figmaProp Placeholder of the number input */
    placeholder?: string
    /**
     * Per-country grouping for the number input, e.g. `formatNationalAsYouType` from
     * `asma-core-helpers/phone`. Injected rather than built in: this library owns no phone rules
     * and no country metadata (ADR-0017 DEC-001).
     */
    formatNationalNumber?: (nationalNumber: string, iso2: string) => string
    renderFlag?: RenderCountryFlag
    /** Title of the country picker. Consumer-supplied — this library ships no user-facing copy. */
    selectCountryLabel: string
    /** Placeholder of the country search box. Consumer-supplied. */
    searchPlaceholder: string
    id?: string
    name?: string
    size?: FieldSize
    /**
     * Applied to the surface of **both** controls, so the pair cannot drift apart visually —
     * e.g. `'bg-white'` where the field sits on a tinted panel.
     */
    fieldClassName?: string
    helperTextClassName?: string
    className?: string
}

const digitsOnly = (value: string): string => value.replace(/\D/g, '')

/**
 * @figmaNode y2whTsnmk1J2dy5fwbM7GK#8523-109515
 * Figma "Phone number input": a country trigger (flag + code + chevron) and a separate number
 * input side by side under one label, with a single helper row beneath the pair. The Figma
 * **Property 1** variants (Default/Error/Disabled/Read-only/Menu) map to `error`/`disabled`/
 * `readOnly` and the picker's own open state.
 *
 * Country data, grouping, validation and every user-facing string are supplied by the consumer —
 * this component renders the state it is told about and owns no rules (ADR-0017 DEC-001/REQ-009).
 * Pair it with `asma-core-helpers/phone`, which provides the country list, the formatter and the
 * validator.
 *
 * ponytail: reformatting is applied on every keystroke, so the caret lands at the end of the
 * number after an edit in the middle of it. Phone numbers are short and typed left to right, so
 * this is a deliberate ceiling; the upgrade path is the caret-preserving `formatMaskedValue` in
 * `helpers/inputMask.ts`, which today only handles fixed-width masks.
 */
export const StyledPhoneField = ({
    dataTest,
    label,
    countries,
    country,
    onCountryChange,
    value,
    onChange,
    onBlur,
    error,
    helperText,
    reserveHelperText = true,
    disabled,
    readOnly,
    readOnlyText,
    required,
    placeholder,
    formatNationalNumber,
    renderFlag,
    selectCountryLabel,
    searchPlaceholder,
    id,
    name,
    size = 'medium',
    fieldClassName,
    helperTextClassName,
    className,
}: StyledPhoneFieldProps): JSX.Element => {
    const generatedId = useId()
    const fieldId = id ?? `${generatedId}-phone`
    const labelId = `${fieldId}-label`

    const displayValue = formatNationalNumber?.(value, country) ?? value

    return (
        <div className={cn('flex flex-col', className)} data-testid={`${dataTest}-root`}>
            {label != null && (
                <label id={labelId} htmlFor={fieldId} className='pb-1 text-base font-semibold text-delta-800'>
                    {label}
                    {required === true && <span aria-hidden='true'>&nbsp;*</span>}
                </label>
            )}

            {readOnly === true ? (
                <span data-testid={`${dataTest}-readonly`} className='py-2 text-base text-delta-800'>
                    {readOnlyText ?? displayValue}
                </span>
            ) : (
                <div className='flex items-start gap-2'>
                    <CountryCodeSelect
                        dataTest={`${dataTest}-country`}
                        countries={countries}
                        value={country}
                        onChange={onCountryChange}
                        disabled={disabled}
                        selectCountryLabel={selectCountryLabel}
                        searchPlaceholder={searchPlaceholder}
                        renderFlag={renderFlag}
                        labelledBy={label == null ? undefined : labelId}
                        className={fieldClassName}
                    />
                    <StyledInputField
                        dataTest={`${dataTest}-number`}
                        id={fieldId}
                        name={name}
                        value={displayValue}
                        onChange={(event) => onChange(digitsOnly(event.target.value))}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        error={error}
                        disabled={disabled}
                        required={required}
                        fullWidth
                        // Figma aligns the message with the number input's left edge, not the
                        // pair's — so the input owns the one helper slot, and with it the
                        // always-mounted row, `aria-describedby`, `role=alert` and the
                        // borrow-free-space behaviour it already implements.
                        helperText={helperText}
                        reserveHelperText={reserveHelperText}
                        size={size}
                        slotProps={{
                            htmlInput: { inputMode: 'tel', autoComplete: 'tel' },
                            input: { className: fieldClassName },
                            formHelperText: { className: helperTextClassName },
                        }}
                    />
                </div>
            )}
        </div>
    )
}
