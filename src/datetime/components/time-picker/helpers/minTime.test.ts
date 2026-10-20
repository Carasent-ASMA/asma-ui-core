import { describe, expect, it } from 'vitest'
import { clampToMinTime, isBeforeMinTime, isHourDisabled, isMinuteDisabled } from './minTime'

const at = (hours: number, minutes: number, day = 5): Date => new Date(2026, 9, day, hours, minutes)

describe('time picker minTime', () => {
    it('compares clock time only, ignoring the calendar day', () => {
        expect(isBeforeMinTime(at(12, 34, 9), at(12, 35, 1))).toBe(true)
        expect(isBeforeMinTime(at(12, 35, 1), at(12, 35, 9))).toBe(false)
    })

    it('allows everything without a valid minTime', () => {
        expect(isBeforeMinTime(at(0, 0), undefined)).toBe(false)
        expect(isBeforeMinTime(at(0, 0), new Date(Number.NaN))).toBe(false)
        expect(isHourDisabled(0, undefined)).toBe(false)
        expect(isMinuteDisabled(0, 0, undefined)).toBe(false)
    })

    it('disables earlier hours and keeps the minTime hour while one of its minute cells is left', () => {
        expect(isHourDisabled(11, at(12, 32))).toBe(true)
        expect(isHourDisabled(12, at(12, 32))).toBe(false)
        expect(isHourDisabled(12, at(12, 55))).toBe(false)
        // 12:57 leaves no 5-minute cell in hour 12.
        expect(isHourDisabled(12, at(12, 57))).toBe(true)
        expect(isHourDisabled(13, at(12, 57))).toBe(false)
    })

    it('disables earlier minutes only within the minTime hour', () => {
        expect(isMinuteDisabled(12, 30, at(12, 32))).toBe(true)
        expect(isMinuteDisabled(12, 35, at(12, 32))).toBe(false)
        expect(isMinuteDisabled(13, 0, at(12, 32))).toBe(false)
    })

    it('moves minutes up to the first enabled cell when the kept minutes are too early', () => {
        expect(clampToMinTime(at(12, 10), at(12, 32))).toEqual(at(12, 35))
        expect(clampToMinTime(at(12, 30), at(12, 30))).toEqual(at(12, 30))
        expect(clampToMinTime(at(14, 10), at(12, 32))).toEqual(at(14, 10))
    })
})
