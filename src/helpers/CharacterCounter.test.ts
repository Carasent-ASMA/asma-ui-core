import { describe, expect, it } from 'vitest'
import { fieldWidthForMaxLength } from 'src/components/inputs/field-styles'
import { isNearCharacterLimit } from './CharacterCounter'

describe('isNearCharacterLimit', () => {
    it('speaks within the last 10 characters of a long limit', () => {
        expect(isNearCharacterLimit(89, 100)).toBe(false)
        expect(isNearCharacterLimit(90, 100)).toBe(true)
        expect(isNearCharacterLimit(989, 1000)).toBe(false)
        expect(isNearCharacterLimit(990, 1000)).toBe(true)
    })

    it('speaks only in the last fifth of a short limit, at least at the last character', () => {
        expect(isNearCharacterLimit(15, 20)).toBe(false)
        expect(isNearCharacterLimit(16, 20)).toBe(true)
        expect(isNearCharacterLimit(3, 5)).toBe(false)
        expect(isNearCharacterLimit(4, 5)).toBe(true)
    })
})

describe('fieldWidthForMaxLength', () => {
    it('picks the step from the limit: up to 9 XS, 15 S, 27 M, longer Full', () => {
        expect([4, 9, 10, 15, 16, 27, 28, 100].map(fieldWidthForMaxLength)).toEqual([
            'xs',
            'xs',
            's',
            's',
            'm',
            'm',
            'full',
            'full',
        ])
    })
})
