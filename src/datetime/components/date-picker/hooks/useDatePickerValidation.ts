import { parse, isValid as isValidDateFns, startOfDay } from 'date-fns'
import { useCallback, useState } from 'react'
import type { Matcher } from 'react-day-picker'
import { buildDisabled, isDisabledDate } from '../helpers'

export interface DatePickerValidationMessages {
    required: string
    minDate: string
    invalidDay: string
    invalidMonth: string
    invalidYear: string
    invalidDate: string
    invalidFormat: string
    dateDisabled: string
    pastNotAllowed: string
    futureNotAllowed: string
}

export interface DatePickerValidationMessageCatalog {
    en: DatePickerValidationMessages
    nb: DatePickerValidationMessages
}

export const defaultDatePickerValidationMessages: DatePickerValidationMessageCatalog = {
    en: {
        required: 'Required',
        minDate: 'Select a date after the start date.',
        invalidDay: 'Enter a valid day.',
        invalidMonth: 'Enter a valid month.',
        invalidYear: 'Enter a year between 1900 and 2100.',
        invalidDate: 'Enter a valid date.',
        invalidFormat: 'Enter a valid date in DD.MM.YYYY format.',
        dateDisabled: 'Select another date.',
        pastNotAllowed: 'Select today or a future date.',
        futureNotAllowed: 'Select today or an earlier date.',
    },
    nb: {
        required: 'Obligatorisk',
        minDate: 'Velg en dato etter startdatoen.',
        invalidDay: 'Skriv inn en gyldig dag.',
        invalidMonth: 'Skriv inn en gyldig måned.',
        invalidYear: 'Skriv inn et år mellom 1900 og 2100.',
        invalidDate: 'Skriv inn en gyldig dato.',
        invalidFormat: 'Skriv inn en gyldig dato i formatet DD.MM.ÅÅÅÅ.',
        dateDisabled: 'Velg en annen dato.',
        pastNotAllowed: 'Velg dagens dato eller en senere dato.',
        futureNotAllowed: 'Velg dagens dato eller en tidligere dato.',
    },
}

const formatRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/

interface DatePickerValidation {
    validationError: boolean
    errHelperText: string
    clearValidation: () => void
    handleValidation: (args: {
        value: string
        disabledDays?: Matcher | Matcher[]
        localeCode?: string
        disallowPast?: boolean
        disallowFuture?: boolean
        required?: boolean
        minDate?: Date
    }) => boolean
}

export const useDatePickerValidation = (
    messages: DatePickerValidationMessageCatalog = defaultDatePickerValidationMessages,
): DatePickerValidation => {
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
            const msgs = messages[lang]
            const digits = value.replace(/\D/g, '')

            // empty => required error only when explicitly enabled
            if (!digits.length) {
                setError(!!required)
                setErrHelperText(required ? msgs.required : '')
                return !!required
            }

            //1. check for format DD/MM/YYYY
            const m = formatRegex.exec(value)
            if (!m) {
                setError(true)
                setErrHelperText(msgs.invalidFormat)
                return true
            }

            const dd = Number(m[1])
            const mm = Number(m[2])
            const yyyy = Number(m[3])

            // 1) DAY invalid => "Invalid day"
            if (dd < 1 || dd > 31) {
                setError(true)
                setErrHelperText(msgs.invalidDay)
                return true
            }

            // - month invalid -> Invalid month
            if (mm < 1 || mm > 12) {
                setError(true)
                setErrHelperText(msgs.invalidMonth)
                return true
            }

            // - year invalid => Invalid year
            if (yyyy < 1900 || yyyy > 2100) {
                setError(true)
                setErrHelperText(msgs.invalidYear)
                return true
            }

            // 4) full date validity (e.g., 31/04/2025)
            const d = new Date(yyyy, mm - 1, dd)
            const calendarOk = d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd
            if (!calendarOk) {
                setError(true)
                setErrHelperText(msgs.invalidDate)
                return true
            }

            const canonical = `${m[1]}/${m[2]}/${m[3]}`
            const parsed = parse(canonical, 'dd/MM/yyyy', new Date())
            if (!isValidDateFns(parsed)) {
                setError(true)
                setErrHelperText(msgs.invalidDate)
                return true
            }

            if (minDate && startOfDay(parsed) <= startOfDay(minDate)) {
                setError(true)
                setErrHelperText(msgs.minDate)
                return true
            }

            // 5) check disabled date
            const mergedDisabled = buildDisabled(disabledDays, disallowPast, disallowFuture)
            if (mergedDisabled.length) {
                const policyHit = isDisabledDate({ parsedDate: parsed, disabledDays: mergedDisabled })
                if (policyHit) {
                    setErrHelperText(msgs.dateDisabled)
                    setError(true)
                    return true
                }
            }

            clearValidation()
            return false
        },
        [clearValidation, messages],
    )
    return { validationError, handleValidation, errHelperText, clearValidation }
}
