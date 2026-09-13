import { describe, expect, it } from 'vitest'
import { compositeOver, contrastRatio, parseCssColor, relativeLuminance, type Rgba } from './wcagContrast'

/**
 * Self-check for the contrast maths. A contrast gate is only worth the trust placed in its
 * arithmetic, so the reference values here come from the WCAG definitions and from ratios measured
 * independently by ASMA-8136's axe run, not from this implementation's own output.
 */

const mustParse = (value: string): Rgba => {
    const parsed = parseCssColor(value)

    if (parsed === null) {
        throw new Error(`Expected ${value} to parse`)
    }

    return parsed
}

describe('parseCssColor', () => {
    it('parses the keywords the theme CSS uses', () => {
        expect(parseCssColor('white')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
        expect(parseCssColor('black')).toEqual({ r: 0, g: 0, b: 0, a: 1 })
        expect(parseCssColor('transparent')).toEqual({ r: 0, g: 0, b: 0, a: 0 })
    })

    it('treats the short and long hex forms as equivalent', () => {
        expect(parseCssColor('#abc')).toEqual(parseCssColor('#aabbcc'))
        expect(parseCssColor('#ABC')).toEqual(parseCssColor('#aabbcc'))
    })

    it('reads the alpha channel from 8-digit hex', () => {
        // --colors-slate-200 in rootVariables.css is #abc8d42f.
        const parsed = mustParse('#abc8d42f')

        expect(parsed.r).toBe(0xab)
        expect(parsed.a).toBeCloseTo(0x2f / 255, 5)
    })

    it('parses both rgb() notations', () => {
        expect(parseCssColor('rgb(1, 2, 3)')).toEqual({ r: 1, g: 2, b: 3, a: 1 })
        expect(parseCssColor('rgba(1, 2, 3, 0.5)')).toEqual({ r: 1, g: 2, b: 3, a: 0.5 })
        expect(parseCssColor('rgb(1 2 3 / 50%)')).toEqual({ r: 1, g: 2, b: 3, a: 0.5 })
    })

    it('returns null rather than guessing at values it does not understand', () => {
        // Anything unparsed must surface as a failure, never as a silently-skipped assertion.
        expect(parseCssColor('210deg 16% 95%')).toBeNull()
        expect(parseCssColor('1px')).toBeNull()
        expect(parseCssColor('currentColor')).toBeNull()
        expect(parseCssColor('#ab')).toBeNull()
    })
})

describe('relativeLuminance', () => {
    it('matches the WCAG definition at the endpoints', () => {
        expect(relativeLuminance(mustParse('#ffffff'))).toBeCloseTo(1, 10)
        expect(relativeLuminance(mustParse('#000000'))).toBeCloseTo(0, 10)
    })

    it('uses the sRGB transfer curve, not a linear ramp', () => {
        // Mid-grey is ~0.2159, not 0.5 — the classic mistake this asserts against.
        expect(relativeLuminance(mustParse('#808080'))).toBeCloseTo(0.2159, 4)
    })
})

describe('contrastRatio', () => {
    it('spans the full 1:1 to 21:1 range', () => {
        expect(contrastRatio(mustParse('#000000'), mustParse('#ffffff'))).toBe(21)
        expect(contrastRatio(mustParse('#ffffff'), mustParse('#ffffff'))).toBe(1)
    })

    it('is symmetric in its arguments', () => {
        const first = mustParse('#007cb5')
        const second = mustParse('#ffffff')

        expect(contrastRatio(first, second)).toBe(contrastRatio(second, first))
    })

    it.each([
        // Measured independently by ASMA-8136's axe run over the story baseline.
        ['#7a899e', 3.55],
        ['#bdc4cf', 1.75],
        ['#36b17a', 2.71],
        ['#ff7b2e', 2.58],
        ['#b66e97', 3.7],
    ])('agrees with the axe baseline for %s on white', (hex, expected) => {
        expect(contrastRatio(mustParse(hex), mustParse('#ffffff'))).toBeCloseTo(expected, 2)
    })

    it('truncates rather than rounds, so a near-miss cannot pass the threshold', () => {
        // #767676 is the canonical "smallest grey that passes 4.5:1 on white"; #777777 is the
        // first step that does not. Truncation keeps the boundary where the spec puts it.
        expect(contrastRatio(mustParse('#767676'), mustParse('#ffffff'))).toBe(4.54)
        expect(contrastRatio(mustParse('#777777'), mustParse('#ffffff'))).toBe(4.47)
    })
})

describe('compositeOver', () => {
    it('leaves an opaque source untouched', () => {
        const source = mustParse('#123456')

        expect(compositeOver(source, mustParse('#ffffff'))).toEqual({ ...source, a: 1 })
    })

    it('returns the backdrop when the source is fully transparent', () => {
        const backdrop = mustParse('#123456')

        expect(compositeOver(mustParse('transparent'), backdrop)).toEqual({ ...backdrop, a: 1 })
    })

    it('blends a half-transparent source toward the backdrop', () => {
        const blended = compositeOver(mustParse('rgba(0, 0, 0, 0.5)'), mustParse('#ffffff'))

        expect(blended.r).toBeCloseTo(127.5, 5)
        expect(blended.a).toBe(1)
    })

    it('always produces an opaque result, so a ratio is never computed against a translucent colour', () => {
        expect(compositeOver(mustParse('#abc8d42f'), mustParse('#ffffff')).a).toBe(1)
    })
})
