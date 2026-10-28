import type { AriaAttributes } from 'react'
import type { DayPicker, Matcher } from 'react-day-picker'
import type { FieldWidth } from 'src/components/inputs/field-styles'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

type CommonDatePickerProps = {
    dateFormat?: string
    readOnly?: boolean
    /** A locked field (disabled-states DIS-9): read-only with a lock icon; the reason opens on hover, focus and tap. */
    lockedReason?: React.ReactNode
    /**
     * A read-only value the user can change elsewhere (disabled-states DIS-6): the date as text-like,
     * focusable text with no calendar button; the reason says where it can be changed.
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
    /** Field width pattern step of each date field, calendar button included. Defaults to S. */
    width?: FieldWidth
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
    /** Keeps the one-line helper row even without a helper or error, so an error never moves the layout. */
    reserveHelperText?: boolean
    /**
     * Extra ARIA attributes for the text input (e.g. `aria-label`, `aria-required`). Without them the
     * input is named by `title`, which is otherwise plain text above the field.
     */
    inputAriaProps?: AriaAttributes
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
