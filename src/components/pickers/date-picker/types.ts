import type { DayPicker, Matcher } from 'react-day-picker'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

type CommonDatePickerProps = {
    dateFormat?: string
    className?: string
    inputClassName?: string
    onClear?: () => void
    allowClear?: boolean
    disabledDays?: Matcher | Matcher[]
    dataTest: string
    helperText?: React.ReactNode
    error?: boolean
} & CalendarProps

type DefaultSingleProps = {
    mode: 'single'
    compact?: never
    //
    placeholder?: string
    placeholderFrom?: never
    placeholderTo?: never
    //
    label?: string
    labelFrom?: never
    labelTo?: never
}

type DefaultRangeProps = {
    mode: 'range'
    compact?: never
    //
    placeholder?: string
    placeholderFrom?: never
    placeholderTo?: never
    //
    label?: string
    labelFrom?: never
    labelTo?: never
}

type CompactRangeProps = {
    mode: 'range'
    compact: true
    //
    placeholder?: never
    placeholderFrom?: string
    placeholderTo?: string
    //
    label?: never
    labelFrom?: string
    labelTo?: string
}

export type DatePickerProps = CommonDatePickerProps & (CompactRangeProps | DefaultRangeProps | DefaultSingleProps)
