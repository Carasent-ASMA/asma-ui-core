import { describe, expect, it } from 'vitest'
import { formatResultsLabel } from './formatResultsLabel'

describe('formatResultsLabel', () => {
    it('shows the count in parentheses, even for exactly one result', () => {
        expect(formatResultsLabel(248, 'no')).toBe('Vis resultater (248)')
        expect(formatResultsLabel(1, 'no')).toBe('Vis resultater (1)')
    })

    it('reads "Ingen treff" at zero', () => {
        expect(formatResultsLabel(0, 'no')).toBe('Ingen treff')
    })

    it('caps at four digits so the label never wraps', () => {
        expect(formatResultsLabel(9999, 'no')).toBe('Vis resultater (9999)')
        expect(formatResultsLabel(10000, 'no')).toBe('Vis resultater (9999+)')
    })

    it('falls back to the bare label when the total is unavailable', () => {
        expect(formatResultsLabel(null, 'no')).toBe('Vis resultater')
        expect(formatResultsLabel(undefined, 'no')).toBe('Vis resultater')
    })

    it('reads English by default', () => {
        expect(formatResultsLabel(248)).toBe('Show results (248)')
        expect(formatResultsLabel(0)).toBe('No matches')
        expect(formatResultsLabel(10000)).toBe('Show results (9999+)')
        expect(formatResultsLabel(null)).toBe('Show results')
    })
})
