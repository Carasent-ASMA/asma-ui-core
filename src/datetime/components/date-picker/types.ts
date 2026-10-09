import type { DayPicker, Matcher } from 'react-day-picker'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

type CommonDatePickerProps = {
    dateFormat?: string
    readOnly?: boolean
    /**
     * @figmaProp none — behavioral. Why the date can't be changed here, and where it can. With
     * `readOnly` the field is shown borderless and text-like, stays focusable and shows the reason on
     * hover, focus and tap (disabled-states DIS-6). Without `readOnly` it has no effect.
     */
    readOnlyReason?: React.ReactNode
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

export interface DatePickerSingleFieldProps {
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

export interface DatePickerRangeFieldProps {
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
