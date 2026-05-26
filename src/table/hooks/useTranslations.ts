import { useMemo } from 'react'

const translations = {
    en: {
        column_reorder: 'This column is fixed and can’t be reordered.',
        column_hidden: 'This column is fixed and can’t be hidden.',
        reset_order: 'Reset order',
    },
    no: {
        column_reorder: 'Denne kolonnen er fast og kan ikke flyttes.',
        column_hidden: 'Denne kolonnen er fast og kan ikke skjules.',
        reset_order: 'Tilbakestill rekkefølge',
    },
}

export function useTranslations(locale: 'no' | 'en' = 'en') {
    return useMemo(() => translations[locale] ?? translations.en, [locale])
}
