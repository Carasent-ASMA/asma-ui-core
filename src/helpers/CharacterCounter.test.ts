import { describe, expect, it } from 'vitest'
import { fieldWidthForMaxLength } from 'src/components/inputs/field-styles'
import { isNearCharacterLimit } from './CharacterCounter'

describe('isNearCharacterLimit', () => {
    it('speaks within the last 10 characters of a short limit', () => {
        expect(isNearCharacterLimit(89, 100)).toBe(false)
        expect(isNearCharacterLimit(90, 100)).toBe(true)
    })

    it('speaks within the last tenth of a long limit', () => {
        expect(isNearCharacterLimit(899, 1000)).toBe(false)
        expect(isNearCharacterLimit(900, 1000)).toBe(true)
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
