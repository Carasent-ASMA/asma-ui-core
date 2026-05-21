import { parse, isValid as isValidDateFns, startOfDay } from 'date-fns'
import { useCallback, useState } from 'react'
import type { Matcher } from 'react-day-picker'
import { buildDisabled, isDisabledDate } from '../helpers'

const msgs = {
    en: {
        required: 'Required',
        minDate: 'End date must be after the start date',
        invalidDay: 'Invalid day',
        invalidMonth: 'Invalid month',
        invalidYear: 'Invalid year. Year must be between 1900-2100',
        invalidDate: 'Invalid date',
        invalidFormat: 'Invalid date. Use format DD.MM.YYYY',
        dateDisabled: 'Date is disabled',
        pastNotAllowed: 'Past date is not allowed',
        futureNotAllowed: 'Future date is not allowed',
    },
    nb: {
        required: 'Påkrevd',
        minDate: 'Sluttdato må være etter startdato',
        invalidDay: 'Ugyldig dag',
        invalidMonth: 'Ugyldig måned',
        invalidYear: 'Ugyldig år. År må være mellom 1900 og 2100',
        invalidDate: 'Ugyldig dato',
        invalidFormat: 'Ugyldig dato. Bruk formatet DD.MM.ÅÅÅÅ',
        dateDisabled: 'Dato er ugyldig',
        pastNotAllowed: 'Dato i fortiden er ikke tillatt',
        futureNotAllowed: 'Dato i fremtiden er ikke tillatt',
    },
} as const

const formatRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
export const useDatePickerValidation = () => {
    const [validationError, setError] = useState(false)
    const [errHelperText, setErrHelperText] = useState('')

    const clearValidation = useCallback(() => {
        setError(false)
        setErrHelperText('')
    }, [])

    const handleValidation = useCallback(
        ({
            value,
            disabledDays,
            localeCode,
            disallowPast,
            disallowFuture,
            required,
            minDate,
        }: {
            value: string
            disabledDays?: Matcher | Matcher[]
            localeCode?: string
            disallowPast?: boolean
            disallowFuture?: boolean
            required?: boolean
            minDate?: Date
        }): boolean => {
            const lang = localeCode === 'nb' ? 'nb' : 'en'
            const digits = value.replace(/\D/g, '')

            // empty => required error only when explicitly enabled
            if (!digits.length) {
                setError(!!required)
                setErrHelperText(required ? msgs[lang].required : '')
                return !!required
            }

            //1. check for format DD/MM/YYYY
            const m = value.match(formatRegex)
            if (!m) {
                setError(true)
                setErrHelperText(msgs[lang].invalidFormat)
                return true
            }

            const dd = Number(m[1])
            const mm = Number(m[2])
            const yyyy = Number(m[3])

            // 1) DAY invalid => "Invalid day"
            if (dd < 1 || dd > 31) {
                setError(true)
                setErrHelperText(msgs[lang].invalidDay)
                return true
            }

            // - month invalid -> Invalid month
            if (mm < 1 || mm > 12) {
                setError(true)
                setErrHelperText(msgs[lang].invalidMonth)
                return true
            }

            // - year invalid => Invalid year
            if (yyyy < 1900 || yyyy > 2100) {
                setError(true)
                setErrHelperText(msgs[lang].invalidYear)
                return true
            }

            // 4) full date validity (e.g., 31/04/2025)
            const d = new Date(yyyy, mm - 1, dd)
            const calendarOk = d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd
            if (!calendarOk) {
                setError(true)
                setErrHelperText(msgs[lang].invalidDate)
                return true
            }

            const canonical = `${m[1]}/${m[2]}/${m[3]}`
            const parsed = parse(canonical, 'dd/MM/yyyy', new Date())
            if (!isValidDateFns(parsed)) {
                setError(true)
                setErrHelperText(msgs[lang].invalidDate)
                return true
            }

            if (minDate && startOfDay(parsed) <= startOfDay(minDate)) {
                setError(true)
                setErrHelperText(msgs[lang].minDate)
                return true
            }

            // 5) check disabled date
            const mergedDisabled = buildDisabled(disabledDays, disallowPast, disallowFuture)
            if (mergedDisabled.length) {
                const policyHit = isDisabledDate({ parsedDate: parsed, disabledDays: mergedDisabled })
                if (policyHit) {
                    setErrHelperText(msgs[lang].dateDisabled)
                    setError(true)
                    return true
                }
            }

            clearValidation()
            return false
        },
        [clearValidation],
    )
    return { validationError, handleValidation, errHelperText, clearValidation }
}
