import { describe, expect, it } from 'vitest'
import { formatResultsLabel } from './formatResultsLabel'

describe('formatResultsLabel', () => {
    it('shows the count in parentheses, even for exactly one result', () => {
        expect(formatResultsLabel(248)).toBe('Vis resultater (248)')
        expect(formatResultsLabel(1)).toBe('Vis resultater (1)')
    })

    it('reads "Ingen treff" at zero', () => {
        expect(formatResultsLabel(0)).toBe('Ingen treff')
    })

    it('caps at four digits so the label never wraps', () => {
        expect(formatResultsLabel(9999)).toBe('Vis resultater (9999)')
        expect(formatResultsLabel(10000)).toBe('Vis resultater (9999+)')
    })

    it('falls back to the bare label when the total is unavailable', () => {
        expect(formatResultsLabel(null)).toBe('Vis resultater')
        expect(formatResultsLabel(undefined)).toBe('Vis resultater')
    })
})
