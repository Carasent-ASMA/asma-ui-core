import { describe, expect, it } from 'vitest'
import {
    columnSizingSignature,
    getColumnSizingStorageKey,
    sanitizeColumnSizing,
    serializeColumnSizing,
} from './useColumnSizingPersistence'

describe('sanitizeColumnSizing (ASMA-8597)', () => {
    it('U-W01: a legacy flat width map still loads (AC 4)', () => {
        expect(sanitizeColumnSizing({ name: 240, role: 120.5 })).toEqual({ name: 240, role: 120.5 })
    })

    it('U-W02: the width of a column that is not there is kept (TanStack applies it when the column appears), with its shape checked', () => {
        expect(sanitizeColumnSizing({ name: 240, 'column-that-was-removed': 500, v: 1 })).toEqual({
            name: 240,
            'column-that-was-removed': 500,
            v: 1,
        })
    })

    it('U-W03: NaN, Infinity, 0, negatives, strings, arrays and null are dropped', () => {
        expect(
            sanitizeColumnSizing(
                {
                    name: Number.NaN,
                    role: Number.POSITIVE_INFINITY,
                    age: 0,
                },
            ),
        ).toEqual({})
        expect(
            sanitizeColumnSizing({ name: -5, role: '200', age: [200] }),
        ).toEqual({})
        expect(sanitizeColumnSizing({ name: null, role: 150 })).toEqual({ role: 150 })
        // JSON has no NaN or Infinity; those arrive as null, and anything but an object is not a width map.
        for (const raw of [[], [240], null, 'name', 240, true, undefined]) {
            expect(sanitizeColumnSizing(raw), String(raw)).toBeUndefined()
        }
    })

    it('keys the entry as ${uniqueKey}:column-sizing', () => {
        expect(getColumnSizingStorageKey('table-a')).toBe('table-a:column-sizing')
        expect(getColumnSizingStorageKey(undefined)).toBeUndefined()
    })

    it('U-W08: the saved shape is a flat { "<columnId>": <number> } map: unversioned, no wrapper', () => {
        const parsed = JSON.parse(serializeColumnSizing({ name: 240, role: 120 })) as Record<string, unknown>

        expect(parsed).toEqual({ name: 240, role: 120 })
        expect(Object.keys(parsed)).not.toContain('v')
    })

    it('compares the same widths in any key order as equal', () => {
        expect(columnSizingSignature({ name: 1, role: 2 })).toBe(columnSizingSignature({ role: 2, name: 1 }))
        expect(columnSizingSignature({ name: 1 })).not.toBe(columnSizingSignature({ name: 2 }))
        expect(columnSizingSignature({})).toBe(columnSizingSignature({}))
    })
})
