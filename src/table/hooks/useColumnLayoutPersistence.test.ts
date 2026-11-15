import { describe, expect, it } from 'vitest'
import type { LeafColumnInfo } from '../helpers/columnIds'
import {
    columnLayoutInputsChanged,
    getColumnOrderStorageKey,
    getColumnVisibilityStorageKey,
    sanitizeColumnOrder,
    sanitizeColumnVisibility,
    type ColumnLayoutInputs,
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

    it('U-S04: a versioned visibility keeps booleans for columns that may hide and for ids no column has yet (DEC-W), and drops internal columns and ones that cannot hide', () => {
        const columns = [column('a'), column('b', false), column('select'), column('c')]

        expect(
            sanitizeColumnVisibility(
                { v: 1, visibility: { a: false, b: false, select: true, c: 'no', ghost: false } },
                columns,
            ),
        ).toEqual({ a: false, ghost: false })
        // `ghost` is no column's id (yet): it is kept, so a column that appears later picks up its saved state.
        // `b` is a column that cannot hide, `select` is internal, and `c` holds no boolean: those are dropped.
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

describe('when the inputs of the column layout have changed (ASMA-8695 audit, ASMA-8698)', () => {
    const inputs = (overrides: Partial<ColumnLayoutInputs> = {}): ColumnLayoutInputs => ({
        signature: undefined,
        definitionIds: ['a', 'b', 'c'],
        defaultOrder: [],
        defaultVisibility: { c: false },
        ...overrides,
    })
    const SAVED = JSON.stringify([['a', 'b', 'c'], [], [['c', false]]])

    it('R-01: nothing to compare with, nothing has changed', () => {
        expect(columnLayoutInputsChanged(undefined, inputs({ signature: SAVED }))).toBe(false)
    })

    it('R-02: the same inputs have not changed, whether or not the last commit recorded its signature', () => {
        expect(columnLayoutInputsChanged(inputs({ signature: SAVED }), inputs({ signature: SAVED }))).toBe(false)
        expect(columnLayoutInputsChanged(inputs({ signature: undefined }), inputs({ signature: SAVED }))).toBe(false)
        expect(columnLayoutInputsChanged(inputs({ signature: SAVED }), inputs({ signature: undefined }))).toBe(false)
    })

    it('R-03: a new column, a new default order and a new default visibility each count as a change', () => {
        const before = inputs({ signature: SAVED })

        expect(columnLayoutInputsChanged(before, inputs({ definitionIds: ['a', 'b', 'x', 'c'] }))).toBe(true)
        expect(columnLayoutInputsChanged(before, inputs({ defaultOrder: ['c', 'a', 'b'] }))).toBe(true)
        expect(columnLayoutInputsChanged(before, inputs({ defaultVisibility: { a: false } }))).toBe(true)
    })

    it('R-04: a table opted in later, with other columns than it had, is reconciled as one opted in all along', () => {
        // The last commit was made while the layout was not saved, so it recorded no signature, only its inputs.
        const whileNotSaved = inputs({ signature: undefined })

        expect(columnLayoutInputsChanged(whileNotSaved, inputs({ definitionIds: ['a', 'b', 'x', 'c'] }))).toBe(true)
        expect(columnLayoutInputsChanged(whileNotSaved, inputs({ defaultVisibility: { b: false } }))).toBe(true)
        expect(columnLayoutInputsChanged(whileNotSaved, inputs({ defaultOrder: ['b', 'a', 'c'] }))).toBe(true)
    })

    it('R-05: the order the default visibility is listed in does not matter', () => {
        const a = inputs({ defaultVisibility: { b: false, c: false } })
        const b = inputs({ defaultVisibility: { c: false, b: false } })

        expect(columnLayoutInputsChanged(a, b)).toBe(false)
    })
})

