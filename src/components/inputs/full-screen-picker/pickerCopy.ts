import type { UiCoreLocale } from 'src/helpers/uiCoreLocale'

/**
 * Every string the full-screen picker shows or announces (ASMA-8468). ui-core ships Norwegian and
 * English defaults; a consumer overrides any of them through `pickerText`.
 *
 * @see asma-modules/_docs/frontend/plans/2026-10-19-11-04-plan-full-screen-select-picker-phones.md:206 — TASK-007
 */
export interface PickerText {
    /** Accessible name of the close button. */
    close: string
    /** Label of the search field. */
    search: string
    /** Several choices: applies the ticks and closes. */
    done: string
    /** One choice, optional field: empties the field. */
    clearOne: string
    /** Several choices: unticks everything, including ticks hidden by the search. */
    clearAll: string
    selectedCount: (count: number) => string
    noMatches: string
    matchCount: (count: number) => string
    /** Announced after `clearOne`. */
    cleared: string
    /** Announced after `clearAll`. */
    clearedAll: string
    truncated: (shown: number, total: number) => string
}

const PICKER_TEXT: Record<UiCoreLocale, PickerText> = {
    no: {
        close: 'Lukk',
        search: 'Søk',
        done: 'Ferdig',
        clearOne: 'Fjern valget',
        clearAll: 'Fjern alle valg',
        selectedCount: (count) => `${count} valgt`,
        noMatches: 'Ingen treff',
        matchCount: (count) => `${count} treff`,
        cleared: 'Valget er fjernet',
        clearedAll: 'Alle valg er fjernet',
        truncated: (shown, total) => `Viser ${shown} av ${total}. Søk for å finne flere.`,
    },
    en: {
        close: 'Close',
        search: 'Search',
        done: 'Done',
        clearOne: 'Clear selection',
        clearAll: 'Clear all selections',
        selectedCount: (count) => `${count} selected`,
        noMatches: 'No matches',
        matchCount: (count) => (count === 1 ? '1 match' : `${count} matches`),
        cleared: 'Selection cleared',
        clearedAll: 'All selections cleared',
        truncated: (shown, total) => `Showing ${shown} of ${total}. Search to find more.`,
    },
}

/** Default picker copy for `locale`, with any consumer overrides applied on top. */
export const getPickerText = (locale: UiCoreLocale, overrides?: Partial<PickerText>): PickerText => ({
    ...PICKER_TEXT[locale],
    ...overrides,
})
