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
} & CalendarProps

type CompactRangeProps = {
    mode: 'range'
    compact: true
    placeholderFrom?: string
    placeholderTo?: string
    labelFrom?: string
    labelTo?: string
    allowClear?: never
    placeholder?: never
}

type DefaultRangeProps = {
    mode: 'range'
    compact?: false
    placeholder?: string

    placeholderFrom?: never
    placeholderTo?: never

    labelFrom?: never
    labelTo?: never

    onClearFrom?: () => void
    onClearTo?: () => void
}

type DefaultSingleProps = {
    mode: 'single'
    dateFormat?: string
    placeholder?: string
    label?: string

    compact?: never
    placeholderFrom?: never
    placeholderTo?: never
    labelFrom?: never
    labelTo?: never
}

export type DatePickerProps = CommonDatePickerProps & (CompactRangeProps | DefaultRangeProps | DefaultSingleProps)
