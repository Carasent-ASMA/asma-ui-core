import { describe, expect, it } from 'vitest'
import { consumerOverrides } from './classOverride'

describe('consumerOverrides — reliable overrides without tailwind-merge', () => {
    it('is false for empty / undefined className', () => {
        expect(consumerOverrides(undefined, 'padding')).toBe(false)
        expect(consumerOverrides('', 'padding-x')).toBe(false)
        expect(consumerOverrides('flex items-center', 'padding')).toBe(false)
    })

    describe('padding (any axis)', () => {
        it('matches every padding utility incl. the p- shorthand', () => {
            for (const c of ['p-4', 'px-0', 'py-2', 'pt-1', 'pr-3', 'pb-2', 'pl-4', 'ps-2', 'pe-2']) {
                expect(consumerOverrides(c, 'padding')).toBe(true)
            }
        })
        it('matches with surrounding classes and the ! important prefix', () => {
            expect(consumerOverrides('flex px-0 gap-2', 'padding')).toBe(true)
            expect(consumerOverrides('w-fit !p-4', 'padding')).toBe(true)
        })
        it('does not match margin or unrelated classes', () => {
            expect(consumerOverrides('mx-2 gap-1', 'padding')).toBe(false)
        })
    })

    describe('padding-x (horizontal-affecting only)', () => {
        it('matches p-, px-, pl-, pr-, ps-, pe-', () => {
            for (const c of ['p-4', 'px-0', 'pl-2', 'pr-2', 'ps-1', 'pe-1']) {
                expect(consumerOverrides(c, 'padding-x')).toBe(true)
            }
        })
        it('does NOT match vertical-only padding', () => {
            for (const c of ['py-2', 'pt-1', 'pb-3']) {
                expect(consumerOverrides(c, 'padding-x')).toBe(false)
            }
        })
    })

    describe('padding-y (vertical-affecting only)', () => {
        it('matches p-, py-, pt-, pb-', () => {
            for (const c of ['p-4', 'py-2', 'pt-1', 'pb-3']) {
                expect(consumerOverrides(c, 'padding-y')).toBe(true)
            }
        })
        it('does NOT match horizontal-only padding', () => {
            for (const c of ['px-0', 'pl-2', 'pr-2']) {
                expect(consumerOverrides(c, 'padding-y')).toBe(false)
            }
        })
    })

    describe('margin / width / display', () => {
        it('matches margin incl. the negative -m prefix', () => {
            expect(consumerOverrides('-mt-2', 'margin')).toBe(true)
            expect(consumerOverrides('mx-auto', 'margin')).toBe(true)
            expect(consumerOverrides('px-2', 'margin')).toBe(false)
        })
        it('matches width utilities', () => {
            expect(consumerOverrides('w-fit', 'width')).toBe(true)
            expect(consumerOverrides('w-full', 'width')).toBe(true)
            expect(consumerOverrides('min-w-0', 'width')).toBe(false)
        })
        it('matches max-width utilities', () => {
            expect(consumerOverrides('max-w-fit', 'max-width')).toBe(true)
            expect(consumerOverrides('max-w-full', 'max-width')).toBe(true)
            expect(consumerOverrides('w-fit max-w-xs', 'max-width')).toBe(true)
            expect(consumerOverrides('w-full', 'max-width')).toBe(false)
        })
        it('matches display utilities as whole words only', () => {
            expect(consumerOverrides('flex items-center', 'display')).toBe(true)
            expect(consumerOverrides('grid', 'display')).toBe(true)
            expect(consumerOverrides('hidden', 'display')).toBe(true)
            expect(consumerOverrides('inline-flex', 'display')).toBe(true)
            // not a display class, just shares a prefix
            expect(consumerOverrides('flex-col gap-2', 'display')).toBe(false)
            expect(consumerOverrides('table-fixed', 'display')).toBe(false)
        })
    })
})
