import { describe, expect, it } from 'vitest'
import { matchesCountryQuery } from './useCountryPicker'

const norway = { dialCode: '47', iso2: 'NO', name: 'Norway' }
const sweden = { dialCode: '46', iso2: 'SE', name: 'Sweden' }
const azerbaijan = { dialCode: '994', iso2: 'AZ', name: 'Azerbaijan' }

describe('matchesCountryQuery', () => {
    it('matches by localized name, case-insensitively', () => {
        expect(matchesCountryQuery(norway, 'nor')).toBe(true)
        expect(matchesCountryQuery(norway, 'NORWAY')).toBe(true)
        expect(matchesCountryQuery(norway, 'sweden')).toBe(false)
    })

    it('matches by calling code, with or without the plus', () => {
        expect(matchesCountryQuery(norway, '47')).toBe(true)
        expect(matchesCountryQuery(norway, '+47')).toBe(true)
        expect(matchesCountryQuery(norway, '4')).toBe(true)
        expect(matchesCountryQuery(sweden, '47')).toBe(false)
        expect(matchesCountryQuery(azerbaijan, '99')).toBe(true)
    })

    it('keeps every row for a query that carries no filter', () => {
        // A bare `+` is what the user has typed on the way to `+47`; emptying the list there
        // reads as "no such country".
        for (const query of ['', '   ', '+', ' + ', '()', '-']) {
            expect(matchesCountryQuery(norway, query)).toBe(true)
            expect(matchesCountryQuery(azerbaijan, query)).toBe(true)
        }
    })

    it('still filters once the plus is followed by a digit', () => {
        expect(matchesCountryQuery(norway, '+4')).toBe(true)
        expect(matchesCountryQuery(azerbaijan, '+4')).toBe(false)
    })
})
