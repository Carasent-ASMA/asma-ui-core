import { describe, expect, it } from 'vitest'
import { compact } from './arrays'

describe('compact', () => {
    it('removes all falsy entries, matching lodash compact', () => {
        expect(compact([1, 0, 'a', '', null, undefined, false, 2])).toEqual([1, 'a', 2])
    })

    it('narrows the element type', () => {
        const items: (string | false | undefined)[] = ['a', false, undefined, 'b']
        const result: string[] = compact(items)
        expect(result).toEqual(['a', 'b'])
    })
})
