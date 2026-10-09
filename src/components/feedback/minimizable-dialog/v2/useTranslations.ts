import { useMemo } from 'react'
import type { ILocale } from './types'

const translations = {
    en: {
        close: 'Close',
        waitUntilSaved: 'Wait until saved',
        expand: 'Expand',
        minimize: 'Minimize',
        fullscreen: 'Fullscreen',
        exitFullscreen: 'Exit fullscreen',
    },
    no: {
        close: 'Lukk',
        waitUntilSaved: 'Vent til lagringen er ferdig',
        expand: 'Utvid',
        minimize: 'Minimer',
        fullscreen: 'Fullskjerm',
        exitFullscreen: 'Avslutt fullskjerm',
    },
}

export function useTranslations(locale: ILocale = 'en'): typeof translations.en {
    return useMemo(() => translations[locale] ?? translations.en, [locale])
}
