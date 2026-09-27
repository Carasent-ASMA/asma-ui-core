import { describe, expect, it } from 'vitest'

import { getDirtyValues } from './getDirtyValues'

describe('getDirtyValues', () => {
    it('returns only dirty leaf fields', () => {
        expect(
            getDirtyValues({ empno: true, epost: false, Navn: true }, { empno: 1, epost: 'a@b.co', Navn: 'Ada' }),
        ).toEqual({ empno: 1, Navn: 'Ada' })
    })

    it('returns nested dirty objects recursively', () => {
        expect(
            getDirtyValues({ profile: { age: false, name: true } }, { other: 1, profile: { age: 30, name: 'Ada' } }),
        ).toEqual({ profile: { name: 'Ada' } })
    })

    it('returns whole arrays when any element is dirty', () => {
        expect(getDirtyValues({ tags: [true, false] }, { name: 'x', tags: ['a', 'b'] })).toEqual({ tags: ['a', 'b'] })
    })

    it('omits an array whose dirty marker is falsy', () => {
        expect(getDirtyValues({ tags: false }, { name: 'x', tags: ['a', 'b'] })).toEqual({})
    })

    it('returns empty object when nothing is dirty', () => {
        expect(getDirtyValues({}, { Navn: 'Ada' })).toEqual({})
        expect(getDirtyValues(undefined, { Navn: 'Ada' })).toEqual({})
    })

    it('returns a copy of all values when dirtyFields is true', () => {
        const values = { empno: 1, Navn: 'Ada' }

        const result = getDirtyValues(true, values)

        expect(result).toEqual(values)
        expect(result).not.toBe(values)
    })

    it('omits a nested object whose children are all clean', () => {
        expect(getDirtyValues({ profile: { age: false } }, { profile: { age: 30 } })).toEqual({})
    })
})
