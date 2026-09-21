import { useMemo, useState, type KeyboardEvent } from 'react'
import type { PhoneCountryChoice } from './types'

/**
 * Matches on localized name **or** calling code, so both `"Norway"` and `"47"` narrow the list
 * to +47 (ASMA-7485). A leading `+` is ignored so pasting `+47` works.
 */
export function matchesCountryQuery(country: PhoneCountryChoice, query: string): boolean {
    const trimmed = query.trim()
    if (trimmed.length === 0) return true

    const digits = trimmed.replace(/^\+/, '').replace(/\D/g, '')

    // A query with neither digits nor letters — a bare `+` on the way to typing `+47`, say —
    // carries no filter, so it must keep every row rather than empty the list.
    if (digits.length === 0 && !/\p{L}/u.test(trimmed)) return true

    if (country.name.toLocaleLowerCase().includes(trimmed.toLocaleLowerCase())) return true

    return digits.length > 0 && country.dialCode.startsWith(digits)
}

export interface UseCountryPickerOptions {
    countries: readonly PhoneCountryChoice[]
    selectedIso2: string
    query: string
    listId: string
    onSelect: (iso2: string, close?: boolean) => void
    onDismiss: () => void
}

export interface CountryPicker {
    visible: readonly PhoneCountryChoice[]
    activeIndex: number | null
    optionId: (index: number) => string
    openWithKeyboard: (direction: -1 | 1) => void
    select: (iso2: string) => void
    dismiss: () => void
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
    const [activeIso2, setActiveIso2] = useState<string | null>(null)

    const visible = useMemo(
        () => countries.filter((country) => matchesCountryQuery(country, query)),
        [countries, query],
    )

    // `null` carries "no cursor" the way `StyledSelect`'s nullable `activeOptionIndex` does, so the
    // indicator and `aria-activedescendant` agree without a second flag to keep in sync. Filtering
    // can hide the active row; the first remaining row takes over.
    const activeIndex =
        activeIso2 === null || visible.length === 0
            ? null
            : Math.max(visible.findIndex((country) => country.iso2 === activeIso2), 0)

    const optionId = (index: number): string => `${listId}-option-${index}`

    const openWithKeyboard = (direction: -1 | 1): void => {
        const fallback = direction === 1 ? visible[0] : visible[visible.length - 1]
        const target = visible.find((country) => country.iso2 === selectedIso2) ?? fallback
        if (target !== undefined) setActiveIso2(target.iso2)
    }

    const move = (direction: -1 | 1): void => {
        if (visible.length === 0) return
        // With no cursor yet — a pointer open — the first arrow steps *off* the selected row rather
        // than landing on it, which is what `StyledSelect.moveActiveOption` does with its null
        // `activeOptionIndex`. With nothing selected, start just outside the list so ArrowDown lands
        // on the first row and ArrowUp wraps to the last.
        const selectedIndex = visible.findIndex((country) => country.iso2 === selectedIso2)
        const from = activeIndex ?? (selectedIndex >= 0 ? selectedIndex : direction === 1 ? -1 : 0)
        const next = visible[(from + direction + visible.length) % visible.length]
        if (next !== undefined) setActiveIso2(next.iso2)
    }

    const select = (iso2: string, close = true): void => {
        if (close) setActiveIso2(null)
        onSelect(iso2, close)
    }

    const dismiss = (): void => {
        setActiveIso2(null)
        onDismiss()
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
            case ' ': {
                if (query !== '') break
                event.preventDefault()
                const activeOnSpace = activeIndex === null ? undefined : visible[activeIndex]
                if (activeOnSpace !== undefined) select(activeOnSpace.iso2, false)
                break
            }
            case 'Enter': {
                event.preventDefault()
                const active = activeIndex === null ? undefined : visible[activeIndex]
                if (active !== undefined) select(active.iso2)
                break
            }
            case 'Escape':
                event.preventDefault()
                dismiss()
                break
            case 'Tab':
                dismiss()
                break
            default:
                break
        }
    }

    return { visible, activeIndex, optionId, openWithKeyboard, select, dismiss, handleKeyDown }
}
