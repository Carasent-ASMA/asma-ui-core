import { useMemo } from 'react'

const translations = {
    en: {
        column_reorder: 'This column is fixed and can’t be reordered.',
        column_hidden: 'This column is fixed and can’t be hidden.',
        // A column that is not fixed but cannot be hidden is not called fixed (ASMA-8597).
        column_unhideable: 'This column can’t be hidden.',
        reset_columns: 'Reset columns',
        columns_reset: 'Columns reset',
        column_settings: 'Column settings',
        // The dot on the pin (a hidden or a moved column) is visual only, so the pin's name says it too
        // (ASMA-8597, UX answer to OQ-04, comment 94738).
        column_settings_changed: 'Column settings, changed',
        // Keyboard reordering in the column settings menu (ASMA-8875, UX comment 95823): the handle's name, the
        // instructions it is described by, the live announcements and the footer hint.
        reorder_column: (column: string): string => `Reorder ${column}`,
        reorder_instructions:
            'Press Space or Enter to pick up the column. Move it with the up and down arrow keys, drop it with Space or Enter, or press Escape to cancel.',
        column_picked_up: (column: string, position: number, total: number): string =>
            `Picked up ${column}. Position ${position} of ${total}.`,
        column_moved: (position: number, total: number): string => `Position ${position} of ${total}.`,
        column_dropped: (column: string, position: number, total: number): string =>
            `Dropped ${column} at position ${position} of ${total}.`,
        column_reorder_cancelled: (column: string, position: number, total: number): string =>
            `Reordering cancelled. ${column} is back at position ${position} of ${total}.`,
        reorder_hint: 'Space to reorder',
        // No-break spaces inside each key and its action, so a narrow menu wraps the hint only between them.
        reorder_hint_lifted: '↑↓\u00a0move · Space\u00a0drop · Esc\u00a0cancel',
    },
    no: {
        column_reorder: 'Denne kolonnen er fast og kan ikke flyttes.',
        column_hidden: 'Denne kolonnen er fast og kan ikke skjules.',
        column_unhideable: 'Denne kolonnen kan ikke skjules.',
        reset_columns: 'Tilbakestill kolonner',
        columns_reset: 'Kolonnene er tilbakestilt',
        column_settings: 'Kolonneinnstillinger',
        column_settings_changed: 'Kolonneinnstillinger, endret',
        reorder_column: (column: string): string => `Flytt ${column}`,
        reorder_instructions:
            'Trykk mellomrom eller Enter for å plukke opp kolonnen. Flytt den med pil opp og pil ned, slipp den med mellomrom eller Enter, eller trykk Escape for å avbryte.',
        column_picked_up: (column: string, position: number, total: number): string =>
            `Plukket opp ${column}. Posisjon ${position} av ${total}.`,
        column_moved: (position: number, total: number): string => `Posisjon ${position} av ${total}.`,
        column_dropped: (column: string, position: number, total: number): string =>
            `Slapp ${column} på posisjon ${position} av ${total}.`,
        column_reorder_cancelled: (column: string, position: number, total: number): string =>
            `Flyttingen er avbrutt. ${column} er tilbake på posisjon ${position} av ${total}.`,
        reorder_hint: 'Mellomrom for å flytte',
        reorder_hint_lifted: '↑↓\u00a0flytt · Mellomrom\u00a0slipp · Esc\u00a0avbryt',
    },
}

export function useTranslations(locale: 'no' | 'en' = 'en'): typeof translations.en {
    return useMemo(() => translations[locale] ?? translations.en, [locale])
}
