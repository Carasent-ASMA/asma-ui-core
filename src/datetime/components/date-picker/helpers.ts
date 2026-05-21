import { format, isAfter, isBefore, set, startOfToday } from 'date-fns'
import type { Dispatch, SetStateAction } from 'react'
import type { Matcher } from 'react-day-picker'

export const getValue = (date?: Date, _dateFormat = 'dd/MM/yyyy') => {
    return date ? format(date, 'dd/MM/yyyy') : ''
}

export const setPickerPosition = (
    e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>,
    setPositionAbove: Dispatch<SetStateAction<boolean>>,
): void => {
    const windowHeight = window.innerHeight
    const inputRect = e.currentTarget.getBoundingClientRect()
    const spaceAbove = inputRect.top
    const spaceBelow = windowHeight - inputRect.bottom

    if (spaceBelow < 300 && spaceAbove > spaceBelow) {
        setPositionAbove(true)
    } else {
        setPositionAbove(false)
    }
}

type IsDisabledArgs = {
    parsedDate?: Date
    disabledDays?: Matcher | Matcher[]
}

const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

export const isDisabledDate = ({ parsedDate, disabledDays }: IsDisabledArgs): boolean => {
    if (!parsedDate || !disabledDays) return false

    const date = stripTime(parsedDate)
    const matchers = Array.isArray(disabledDays) ? disabledDays : [disabledDays]

    return matchers.some((matcher) => {
        if (!matcher) return false

        if (typeof matcher === 'function') {
            return !!matcher(date)
        }

        if (matcher instanceof Date) {
            return isSameDay(date, stripTime(matcher))
        }

        if (Array.isArray(matcher)) {
            return matcher.some((d) => isSameDay(date, stripTime(d)))
        }

        if (typeof matcher !== 'object' || matcher === null) return false

        const { before, after, from, to, dayOfWeek } = matcher as {
            before?: Date
            after?: Date
            from?: Date
            to?: Date
            dayOfWeek?: number | number[]
        }

        if (dayOfWeek !== undefined) {
            const days = Array.isArray(dayOfWeek) ? dayOfWeek : [dayOfWeek]
            if (days.includes(date.getDay())) return true
        }

        if (before && date < stripTime(before)) return true
        if (after && date > stripTime(after)) return true

        if (from || to) {
            const fromDate = from ? stripTime(from) : date
            const toDate = to ? stripTime(to) : date
            if (date >= fromDate && date <= toDate) return true
        }

        return false
    })
}
export const buildDisabled = (
    disabledDays: Matcher | Matcher[] | undefined,
    disallowPast?: boolean,
    disallowFuture?: boolean,
    today = startOfToday(),
): Matcher[] => {
    const result: Matcher[] = []

    if (disabledDays) {
        if (Array.isArray(disabledDays)) {
            result.push(...disabledDays)
        } else {
            result.push(disabledDays)
        }
    }

    if (disallowPast) {
        result.push({ before: today })
    }
    if (disallowFuture) {
        result.push({ after: today })
    }

    return result
}
