import { describe, expect, it } from 'vitest'
import { formatMaskedValue, type InputMaskSpec } from './inputMask'

const dateSpec: InputMaskSpec = { mask: '  /  /    ', maskChar: ' ', showMask: true }
const timeSpec: InputMaskSpec = { mask: 'xx:xx', maskChar: 'x', showMask: false }

describe('formatMaskedValue — date mask "  /  /    " (showMask)', () => {
    it('returns empty when no digits remain so the focused placeholder can show the scaffold', () => {
        expect(formatMaskedValue('', 0, dateSpec)).toEqual({ value: '', caret: 0 })
        expect(formatMaskedValue('a', 1, dateSpec)).toEqual({ value: '', caret: 0 })
    })

    it('renders the full scaffold from the first typed digit', () => {
        expect(formatMaskedValue('1', 1, dateSpec)).toEqual({ value: '1 /  /    ', caret: 1 })
        expect(formatMaskedValue('12/  /    ', 2, dateSpec)).toEqual({ value: '12/  /    ', caret: 2 })
    })

    it('reflows digits typed before a literal into the next slot', () => {
        // previous value '12/  /    ', user types '3' at caret 2 (before the '/')
        expect(formatMaskedValue('123/  /    ', 3, dateSpec)).toEqual({ value: '12/3 /    ', caret: 4 })
    })

    it('formats a complete date and caps overflow digits', () => {
        expect(formatMaskedValue('31122026', 8, dateSpec)).toEqual({ value: '31/12/2026', caret: 10 })
        expect(formatMaskedValue('311220269', 9, dateSpec)).toEqual({ value: '31/12/2026', caret: 10 })
    })

    it('keeps the caret before the literal after deleting a digit-adjacent literal', () => {
        // previous value '12/  /    ', backspace at caret 3 removed the '/'
        expect(formatMaskedValue('12  /    ', 2, dateSpec)).toEqual({ value: '12/  /    ', caret: 2 })
    })
})

describe('formatMaskedValue — time mask "xx:xx" (progressive)', () => {
    it('emits only typed slots, without a trailing literal', () => {
        expect(formatMaskedValue('1', 1, timeSpec)).toEqual({ value: '1', caret: 1 })
        expect(formatMaskedValue('12', 2, timeSpec)).toEqual({ value: '12', caret: 2 })
    })

    it('inserts the literal once a digit lands past it', () => {
        expect(formatMaskedValue('123', 3, timeSpec)).toEqual({ value: '12:3', caret: 4 })
        expect(formatMaskedValue('1234', 4, timeSpec)).toEqual({ value: '12:34', caret: 5 })
    })

    it('drops the trailing literal on deletion so backspace makes progress', () => {
        // previous value '12:3', backspace removed the '3' → raw '12:'
        expect(formatMaskedValue('12:', 3, timeSpec)).toEqual({ value: '12', caret: 2 })
    })

    it('rejects non-digit input entirely', () => {
        expect(formatMaskedValue('ab', 2, timeSpec)).toEqual({ value: '', caret: 0 })
    })
})
