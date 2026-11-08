import { describe, expect, it } from 'vitest'
import { getOverdueDays, resolveCardModel, type CardModelInput } from './cardModel'

const link = { href: '/plan/1' }
const base: CardModelInput = { open: link }

describe('resolveCardModel', () => {
    it('is static without an open target', () => {
        expect(resolveCardModel({}, 0)).toBe('static')
    })

    it('is static when read-only, even with an open target', () => {
        expect(resolveCardModel({ ...base, readOnly: true }, 0)).toBe('static')
    })

    it('is fully clickable when it opens something and holds no control', () => {
        expect(resolveCardModel(base, 0)).toBe('full')
        expect(resolveCardModel({ open: { onOpen: () => undefined } }, 0)).toBe('full')
    })

    it.each([
        ['checkbox', { checkbox: true }],
        ['menu', { menu: true }],
        ['CTA button', { ctaAction: true }],
        ['footer button', { footerAction: true }],
    ])('is partially clickable with a %s', (_name, controls) => {
        expect(resolveCardModel({ ...base, ...controls }, 0)).toBe('partial')
    })

    it('is partially clickable when the body holds a CardControl', () => {
        expect(resolveCardModel(base, 1)).toBe('partial')
    })

    it('does not change model while the checkbox is checked (select mode)', () => {
        expect(resolveCardModel({ ...base, checkbox: true }, 0)).toBe(resolveCardModel({ ...base, checkbox: true }, 0))
    })

    it('stays static when it holds controls but opens nothing', () => {
        expect(resolveCardModel({ menu: true }, 0)).toBe('static')
        expect(resolveCardModel({ menu: true, open: link, readOnly: true }, 2)).toBe('static')
    })
})

describe('getOverdueDays', () => {
    it('is 0 on the due date and before it', () => {
        expect(getOverdueDays(new Date(2026, 9, 30, 23, 59), new Date(2026, 9, 30, 0, 1))).toBe(0)
        expect(getOverdueDays(new Date(2026, 10, 2), new Date(2026, 9, 30))).toBe(0)
    })

    it('counts calendar days, not 24-hour periods', () => {
        expect(getOverdueDays(new Date(2026, 9, 29, 23, 59), new Date(2026, 9, 30, 0, 1))).toBe(1)
        expect(getOverdueDays(new Date(2026, 9, 26, 8, 0), new Date(2026, 9, 30, 7, 0))).toBe(4)
    })

    it('is not shifted by a daylight-saving change', () => {
        // Norway leaves summer time on 2026-10-25.
        expect(getOverdueDays(new Date(2026, 9, 24, 12, 0), new Date(2026, 9, 26, 12, 0))).toBe(2)
        expect(getOverdueDays(new Date(2026, 2, 28, 12, 0), new Date(2026, 2, 30, 12, 0))).toBe(2)
    })
})
