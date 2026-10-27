import { useMemo } from 'react'

const translations = {
    en: {
        column_reorder: 'This column is fixed and can’t be reordered.',
        column_hidden: 'This column is fixed and can’t be hidden.',
        column_reorder_and_hidden: 'This column is fixed and can’t be reordered or hidden.',
        reset_columns: 'Reset columns',
        columns_reset: 'Columns reset',
        // The pin's name stays this text, with no state added for a changed layout: provisional
        // (ASMA-8597 OQ-04) until UX decides whether the dot needs a spoken equivalent.
        column_settings: 'Column settings',
    },
    no: {
        column_reorder: 'Denne kolonnen er fast og kan ikke flyttes.',
        column_hidden: 'Denne kolonnen er fast og kan ikke skjules.',
        column_reorder_and_hidden: 'Denne kolonnen er fast og kan ikke flyttes eller skjules.',
        reset_columns: 'Tilbakestill kolonner',
        columns_reset: 'Kolonnene er tilbakestilt',
        column_settings: 'Kolonneinnstillinger',
    },
}

export function useTranslations(locale: 'no' | 'en' = 'en'): typeof translations.en {
    return useMemo(() => translations[locale] ?? translations.en, [locale])
}
