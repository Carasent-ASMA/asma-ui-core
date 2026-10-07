export type UiCoreLocale = 'en' | 'no'

let explicitLocale: UiCoreLocale | undefined

/**
 * Language of the few texts ui-core speaks on its own, such as the "in progress" announcement of a
 * busy button. Optional: without it ui-core follows the language the shell stores in
 * `localStorage.lang` (or `<html lang>`), and falls back to Norwegian.
 */
export const setUiCoreLocale = (locale: UiCoreLocale | undefined): void => {
    explicitLocale = locale
}

const readStoredLanguage = (): string => {
    try {
        return localStorage.getItem('lang') ?? document.documentElement.lang
    } catch {
        return ''
    }
}

export const getUiCoreLocale = (): UiCoreLocale => {
    if (explicitLocale) return explicitLocale
    if (typeof document === 'undefined') return 'no'
    return readStoredLanguage().toLowerCase().startsWith('en') ? 'en' : 'no'
}
