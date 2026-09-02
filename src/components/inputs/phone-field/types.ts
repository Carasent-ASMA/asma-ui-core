import type { ReactNode } from 'react'

/**
 * One row of the country picker.
 *
 * Declared structurally rather than imported from `asma-core-helpers/phone` on purpose:
 * this package is a kernel member served to the whole fleet, and pulling a phone-metadata
 * dependency into it would put ~20 kB gz of country data in every app's shared bundle.
 * `PhoneCountryOption` from that subpath satisfies this shape, so consumers pass it directly.
 *
 * @see asma-modules/_docs/adr/adr-g-0017-frontend-form-state-and-validation-ownership.md:49 — DEC-001, this library owns presentation only
 */
export interface PhoneCountryChoice {
    /** ISO 3166-1 alpha-2 code, e.g. `'NO'`. */
    iso2: string
    /** Calling code without the leading `+`, e.g. `'47'`. */
    dialCode: string
    /** Country name, already localized by the consumer. */
    name: string
}

/** Renders the flag for a country; see `StyledCountryFlag` for the sprite-backed default. */
export type RenderCountryFlag = (iso2: string) => ReactNode
