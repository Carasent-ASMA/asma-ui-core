import { useMemo } from 'react'
import type { ILocale } from './types'

const translations = {
    en: {
        close: 'Close',
        expand: 'Expand',
        minimize: 'Minimize',
        fullscreen: 'Fullscreen',
        exitFullscreen: 'Exit fullscreen',
    },
    no: {
        close: 'Lukk',
        expand: 'Utvid',
        minimize: 'Minimer',
        fullscreen: 'Fullskjerm',
        exitFullscreen: 'Avslutt fullskjerm',
    },
}

export function useTranslations(locale: ILocale = 'en') {
    return useMemo(() => translations[locale] ?? translations.en, [locale])
}
