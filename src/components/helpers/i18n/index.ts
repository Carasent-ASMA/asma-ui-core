import { english } from './EN'
import { norwegian } from './NO'

export type IAppLanguage = typeof i18n

export let i18n = norwegian.strings

export const languageChanger = (lang: 'No' | 'En') => {
    const html = document.getElementsByTagName('html')[0]

    if (!html) {
        return
    }

    if (lang === 'En') {
        i18n = english.strings
    }
    html.setAttribute('lang', lang.toLowerCase())

    i18n = norwegian.strings
}
