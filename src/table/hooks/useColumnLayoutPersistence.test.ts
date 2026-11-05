import { describe, expect, it } from 'vitest'
import type { LeafColumnInfo } from '../helpers/columnIds'
import {
    getColumnOrderStorageKey,
    getColumnVisibilityStorageKey,
    sanitizeColumnOrder,
    sanitizeColumnVisibility,
} from './useColumnLayoutPersistence'

const column = (id: string, canHide = true): LeafColumnInfo => ({ id, canSort: true, canMultiSort: true, canHide })

describe('the saved column layout entries (ASMA-8695, DEC-02)', () => {
    it('U-S01: the keys are the unique key plus a suffix, and there is none without a unique key', () => {
        expect(getColumnOrderStorageKey('table-1')).toBe('table-1:column-order')
        expect(getColumnVisibilityStorageKey('table-1')).toBe('table-1:column-visibility')
        expect(getColumnOrderStorageKey(undefined)).toBeUndefined()
        expect(getColumnVisibilityStorageKey('')).toBeUndefined()
    })

    it('U-S02: a versioned order is kept, without duplicates and non-strings; an unknown id survives', () => {
        expect(sanitizeColumnOrder({ v: 1, order: ['b', 'a', 'b', 3, null, 'ghost'] })).toEqual(['b', 'a', 'ghost'])
    })

    it.each([
        ['an old raw array', ['a', 'b']],
        ['no version', { order: ['a'] }],
        ['another version', { v: 2, order: ['a'] }],
        ['a string order', { v: 1, order: 'a' }],
        ['an empty order', { v: 1, order: [] }],
        ['an order of non-strings', { v: 1, order: [1, 2] }],
        ['null', null],
        ['text', 'a,b'],
    ])('U-S03: %s is not a saved order', (_label, raw) => {
        expect(sanitizeColumnOrder(raw)).toBeUndefined()
    })

    it('U-S04: a versioned visibility keeps booleans for columns that may hide, drops internal columns and ones that cannot hide', () => {
        const columns = [column('a'), column('b', false), column('select'), column('c')]

        expect(
            sanitizeColumnVisibility(
                { v: 1, visibility: { a: false, b: false, select: true, c: 'no', ghost: false } },
                columns,
            ),
        ).toEqual({ a: false, ghost: false })
    })

    it.each([
        ['the old raw map', { a: false }],
        ['another version', { v: 2, visibility: { a: false } }],
        ['no version', { visibility: { a: false } }],
        ['an array', { v: 1, visibility: ['a'] }],
        ['nothing usable', { v: 1, visibility: { a: 'x' } }],
        ['an empty map', { v: 1, visibility: {} }],
        ['null', null],
    ])('U-S05: %s is not a saved visibility', (_label, raw) => {
        expect(sanitizeColumnVisibility(raw, [column('a')])).toBeUndefined()
    })
})
