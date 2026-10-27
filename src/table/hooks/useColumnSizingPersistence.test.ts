import { describe, expect, it } from 'vitest'
import {
    columnSizingSignature,
    getColumnSizingStorageKey,
    sanitizeColumnSizing,
    serializeColumnSizing,
    unknownColumnSizing,
} from './useColumnSizingPersistence'

const known = new Set(['name', 'role', 'age'])

describe('sanitizeColumnSizing (ASMA-8597)', () => {
    it('U-W01: a legacy flat width map still loads (AC 4)', () => {
        expect(sanitizeColumnSizing({ name: 240, role: 120.5 }, known)).toEqual({ name: 240, role: 120.5 })
    })

    it('U-W02: widths of unknown columns are not applied (kept aside until they appear), known ones are', () => {
        expect(sanitizeColumnSizing({ name: 240, removed: 300, v: 1 }, known)).toEqual({ name: 240 })
    })

    it('U-W03: NaN, Infinity, 0, negatives, strings, arrays and null are dropped', () => {
        expect(
            sanitizeColumnSizing(
                {
                    name: Number.NaN,
                    role: Number.POSITIVE_INFINITY,
                    age: 0,
                },
                known,
            ),
        ).toEqual({})
        expect(
            sanitizeColumnSizing({ name: -5, role: '200', age: [200] }, known),
        ).toEqual({})
        expect(sanitizeColumnSizing({ name: null, role: 150 }, known)).toEqual({ role: 150 })
        // JSON has no NaN or Infinity; those arrive as null, and anything but an object is not a width map.
        for (const raw of [[], [240], null, 'name', 240, true, undefined]) {
            expect(sanitizeColumnSizing(raw, known), String(raw)).toBeUndefined()
        }
    })

    it('U-W09: keeps the valid saved widths of columns that are not there yet, and drops everything that is not a width', () => {
        // `known` is name, role and age. `later` and `extra` are not there yet; the rest are not widths.
        const raw = { name: 240, later: 150, role: -5, notes: '90', gone: Number.POSITIVE_INFINITY, extra: 80 }

        expect(unknownColumnSizing(raw, known)).toEqual({ later: 150, extra: 80 })
        // Known columns are applied by the other reader, never here.
        expect(unknownColumnSizing(raw, new Set(['name', 'later', 'extra']))).toEqual({})
        for (const bad of [[], null, 'name', 240, undefined]) {
            expect(unknownColumnSizing(bad, known), String(bad)).toEqual({})
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
