import { capitalize } from 'lodash-es'

import { i18n } from '../helpers/i18n'

export const generateMonth = (data: number): string => {
    switch (data) {
        case 1:
            return capitalize(i18n.shortMonths_january)
        case 2:
            return capitalize(i18n.shortMonths_february)
        case 3:
            return capitalize(i18n.shortMonths_march)
        case 4:
            return capitalize(i18n.shortMonths_april)
        case 5:
            return capitalize(i18n.shortMonths_may)
        case 6:
            return capitalize(i18n.shortMonths_june)
        case 7:
            return capitalize(i18n.shortMonths_july)
        case 8:
            return capitalize(i18n.shortMonths_august)
        case 9:
            return capitalize(i18n.shortMonths_september)
        case 10:
            return capitalize(i18n.shortMonths_octomber)
        case 11:
            return capitalize(i18n.shortMonths_november)
        case 12:
            return capitalize(i18n.shortMonths_december)

        default:
            return ''
    }
}
