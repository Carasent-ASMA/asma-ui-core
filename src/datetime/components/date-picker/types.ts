import type { DayPicker, Matcher } from 'react-day-picker'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

type CommonDatePickerProps = {
    dateFormat?: string
    readOnly?: boolean
    className?: string
    inputClassName?: string
    disabledDays?: Matcher | Matcher[]
    dataTest: string
    hideCalendar?: boolean
    onClear?: () => void
    validateOnCalendarClose?: boolean
    onValidatedOnce?: () => void
    required?: boolean
} & CalendarProps

export type DatePickerSingleFieldProps = {
    label?: string
    title?: string
    helperText?: React.ReactNode
    error?: boolean
    errorText?: React.ReactNode
    minDate?: Date
    placeholder?: string
    onInputChange?: (date: Date | undefined) => void
    disallowPast?: boolean
    disallowFuture?: boolean
    hideDefaultHelperText?: boolean
}

export type DatePickerRangeFieldProps = {
    labelFrom?: string
    labelTo?: string
    titleFrom?: string
    titleTo?: string
    helperTextFrom?: React.ReactNode
    helperTextTo?: React.ReactNode
    errorFrom?: boolean
    errorTo?: boolean
    errorTextFrom?: React.ReactNode
    errorTextTo?: React.ReactNode
    placeholderFrom?: string
    placeholderTo?: string
    hideDefaultHelperTextFrom?: boolean
    hideDefaultHelperTextTo?: boolean
    onInputChange?: ({ from, to }: { from: Date | undefined; to: Date | undefined }) => void
}

export type DatePickerProps =
    | (CommonDatePickerProps & { mode: 'single' } & DatePickerSingleFieldProps)
    | (CommonDatePickerProps & { mode: 'range' } & DatePickerRangeFieldProps)

export type IDatePickerRange = CommonDatePickerProps & { mode: 'range' } & DatePickerRangeFieldProps
export type IDatePickerSingle = CommonDatePickerProps & { mode: 'single' } & DatePickerSingleFieldProps
