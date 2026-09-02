import { useMemo } from 'react'

const translations = {
    en: {
        column_reorder: 'This column is fixed and can’t be reordered.',
        column_hidden: 'This column is fixed and can’t be hidden.',
        column_reorder_and_hidden: 'This column is fixed and can’t be reordered or hidden.',
        reset_order: 'Reset order',
        column_order_reset: 'Column order reset',
        column_settings: 'Column settings',
    },
    no: {
        column_reorder: 'Denne kolonnen er fast og kan ikke flyttes.',
        column_hidden: 'Denne kolonnen er fast og kan ikke skjules.',
        column_reorder_and_hidden: 'Denne kolonnen er fast og kan ikke flyttes eller skjules.',
        reset_order: 'Tilbakestill rekkefølge',
        column_order_reset: 'Kolonnerekkefølgen er tilbakestilt',
        column_settings: 'Kolonneinnstillinger',
    },
}

export function useTranslations(locale: 'no' | 'en' = 'en'): typeof translations.en {
    return useMemo(() => translations[locale] ?? translations.en, [locale])
}
