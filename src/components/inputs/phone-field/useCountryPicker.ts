import { useMemo, useState, type KeyboardEvent } from 'react'
import type { PhoneCountryChoice } from './types'

/**
 * Matches on localized name **or** calling code, so both `"Norway"` and `"47"` narrow the list
 * to +47 (ASMA-7485). A leading `+` is ignored so pasting `+47` works.
 */
export function matchesCountryQuery(country: PhoneCountryChoice, query: string): boolean {
    const trimmed = query.trim()
    if (trimmed.length === 0) return true
    if (country.name.toLocaleLowerCase().includes(trimmed.toLocaleLowerCase())) return true

    const digits = trimmed.replace(/^\+/, '').replace(/\D/g, '')
    return digits.length > 0 && country.dialCode.startsWith(digits)
}

export interface UseCountryPickerOptions {
    countries: readonly PhoneCountryChoice[]
    selectedIso2: string
    query: string
    listId: string
    onSelect: (iso2: string) => void
    onDismiss: () => void
}

export interface CountryPicker {
    visible: readonly PhoneCountryChoice[]
    activeIndex: number
    optionId: (index: number) => string
    handleKeyDown: (event: KeyboardEvent<HTMLElement>) => void
}

/**
 * Filtering, active-row tracking and keyboard behaviour for the country picker — shared by the
 * desktop trigger (which is itself the combobox) and the mobile sheet (which has its own search
 * box), so the two presentations cannot drift apart on what typing or arrowing does.
 *
 * The active row is tracked by country rather than by index: filtering renumbers every index, and
 * an index would need an effect to stay in range — a re-render behind the list it describes.
 */
export function useCountryPicker({
    countries,
    selectedIso2,
    query,
    listId,
    onSelect,
    onDismiss,
}: UseCountryPickerOptions): CountryPicker {
    const [activeIso2, setActiveIso2] = useState(selectedIso2)

    const visible = useMemo(
        () => countries.filter((country) => matchesCountryQuery(country, query)),
        [countries, query],
    )

    const foundIndex = visible.findIndex((country) => country.iso2 === activeIso2)
    // Filtering can hide the active row; the first remaining row takes over.
    const activeIndex = foundIndex >= 0 ? foundIndex : 0

    const optionId = (index: number): string => `${listId}-option-${index}`

    const move = (delta: number): void => {
        if (visible.length === 0) return
        const next = visible[(activeIndex + delta + visible.length) % visible.length]
        if (next !== undefined) setActiveIso2(next.iso2)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault()
                move(1)
                break
            case 'ArrowUp':
                event.preventDefault()
                move(-1)
                break
            case 'Home': {
                event.preventDefault()
                const first = visible[0]
                if (first !== undefined) setActiveIso2(first.iso2)
                break
            }
            case 'End': {
                event.preventDefault()
                const last = visible[visible.length - 1]
                if (last !== undefined) setActiveIso2(last.iso2)
                break
            }
            case 'Enter': {
                event.preventDefault()
                const active = visible[activeIndex]
                if (active !== undefined) onSelect(active.iso2)
                break
            }
            case 'Escape':
                event.preventDefault()
                onDismiss()
                break
            default:
                break
        }
    }

    return { visible, activeIndex, optionId, handleKeyDown }
}
