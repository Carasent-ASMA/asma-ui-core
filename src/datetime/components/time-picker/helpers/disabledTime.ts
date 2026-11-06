import { MINUTE_STEP } from './minTime'

/**
 * Marking individual clock times unavailable, from a predicate the consumer owns.
 *
 * ## Why a predicate rather than a second bound
 *
 * `minTime` answers one shape of question — "nothing before this" — with a single `<` on day
 * minutes. The question that needed answering here is a **band**, and the band that motivated it
 * wraps midnight: a customer's quiet hours for patient SMS are typically `22:00–06:00`, where
 * `start < end` is false and no pair of bounds expresses it. Mirroring `minTime` with a `maxTime`
 * would have left the wrap rule implicit (`start > end` secretly meaning "inverted") and still only
 * ever described one contiguous band.
 *
 * A predicate states the rule at the call site, where the domain lives, and this file stays a
 * question of which *cells* that rule rejects.
 *
 * ## Only the clock time counts
 *
 * Same contract as {@link isBeforeMinTime}: the calendar day of the date handed to the predicate is
 * the consumer's concern, never this picker's. Cells are probed on the day of the current value so
 * a predicate that happens to read the date still sees a coherent instant.
 */
export type TimePredicate = (time: Date) => boolean

/** The instant a given hour/minute cell stands for, on the day the picker is currently showing. */
const atClock = (reference: Date, hour: number, minute: number): Date => {
    const next = new Date(reference)
    next.setHours(hour, minute, 0, 0)
    return next
}

/**
 * An hour cell is unavailable only when **every** minute cell inside it is.
 *
 * This deliberately mirrors `isHourDisabled`'s rule for `minTime` rather than probing the hour on
 * its own: an hour that is half available is still reachable, and greying it would strand the
 * minutes the consumer does allow. Only the steps the minutes column actually offers are probed —
 * checking all 60 would disable an hour the user can never select into anyway.
 */
export const isHourRejected = (hour: number, reference: Date, isTimeDisabled?: TimePredicate): boolean => {
    if (!isTimeDisabled) return false
    for (let minute = 0; minute < 60; minute += MINUTE_STEP) {
        if (!isTimeDisabled(atClock(reference, hour, minute))) return false
    }
    return true
}

/** A single minute cell, gated by the hour the minutes column is currently showing. */
export const isMinuteRejected = (
    hour: number,
    minute: number,
    reference: Date,
    isTimeDisabled?: TimePredicate,
): boolean => (isTimeDisabled ? isTimeDisabled(atClock(reference, hour, minute)) : false)

/** A complete time — what a typed entry or a stale panel pick has to be checked against. */
export const isTimeRejected = (time: Date | undefined, isTimeDisabled?: TimePredicate): boolean =>
    !!time && !!isTimeDisabled && isTimeDisabled(time)
