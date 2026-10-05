import { isValid } from 'date-fns'

/** The minutes column offers 00, 05 … 55. */
export const MINUTE_STEP = 5

const toDayMinutes = (date: Date): number => date.getHours() * 60 + date.getMinutes()

const hasMinTime = (minTime?: Date): minTime is Date => !!minTime && isValid(minTime)

/** Only the clock time of both dates counts; the calendar day is the consumer's concern. */
export const isBeforeMinTime = (time: Date, minTime?: Date): boolean =>
    hasMinTime(minTime) && toDayMinutes(time) < toDayMinutes(minTime)

/** An hour is disabled when none of its minute cells reaches `minTime` (e.g. hour 12 for 12:57). */
export const isHourDisabled = (hour: number, minTime?: Date): boolean =>
    hasMinTime(minTime) && hour * 60 + (60 - MINUTE_STEP) < toDayMinutes(minTime)

export const isMinuteDisabled = (hour: number, minute: number, minTime?: Date): boolean =>
    hasMinTime(minTime) && hour * 60 + minute < toDayMinutes(minTime)

/**
 * Picking the `minTime` hour while the kept minutes fall before it (13:10 → hour 12 with minTime 12:35)
 * would land on a disabled cell, so the minutes move up to the first enabled cell (12:35).
 */
export const clampToMinTime = (time: Date, minTime?: Date): Date => {
    if (!hasMinTime(minTime) || !isBeforeMinTime(time, minTime)) return time

    const next = new Date(time)
    next.setMinutes(Math.ceil(minTime.getMinutes() / MINUTE_STEP) * MINUTE_STEP)
    return next
}
