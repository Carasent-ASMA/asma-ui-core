import { useMemo } from 'react'

export type ToolbarLocale = 'en' | 'no'

const translations = {
    en: {
        more: 'More',
        clearSelection: 'Clear selection',
        selected: 'selected',
    },
    no: {
        more: 'Mer',
        clearSelection: 'Fjern valg',
        selected: 'valgt',
    },
}

export type ToolbarTranslations = (typeof translations)['en']

export function useToolbarTranslations(locale: ToolbarLocale = 'en'): ToolbarTranslations {
    return useMemo(() => translations[locale] ?? translations.en, [locale])
}

export function formatSelectionLabel(count: number, t: ToolbarTranslations): string {
    return `${count} ${t.selected}`
}
