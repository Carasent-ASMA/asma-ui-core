import { useMemo } from 'react'

const translations = {
    en: {
        column_reorder: 'This column is fixed and can’t be reordered.',
        column_hidden: 'This column is fixed and can’t be hidden.',
        column_reorder_and_hidden: 'This column is fixed and can’t be reordered or hidden.',
        reset_columns: 'Reset columns',
        columns_reset: 'Columns reset',
        column_settings: 'Column settings',
        // The dot on the pin (a hidden or a moved column) is visual only, so the pin's name says it too
        // (ASMA-8597, UX answer to OQ-04, comment 94738).
        column_settings_changed: 'Column settings, changed',
    },
    no: {
        column_reorder: 'Denne kolonnen er fast og kan ikke flyttes.',
        column_hidden: 'Denne kolonnen er fast og kan ikke skjules.',
        column_reorder_and_hidden: 'Denne kolonnen er fast og kan ikke flyttes eller skjules.',
        reset_columns: 'Tilbakestill kolonner',
        columns_reset: 'Kolonnene er tilbakestilt',
        column_settings: 'Kolonneinnstillinger',
        column_settings_changed: 'Kolonneinnstillinger, endret',
    },
}

export function useTranslations(locale: 'no' | 'en' = 'en'): typeof translations.en {
    return useMemo(() => translations[locale] ?? translations.en, [locale])
}
