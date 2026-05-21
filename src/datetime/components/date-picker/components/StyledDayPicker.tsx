import {
    DayPicker,
    type DateRange,
    type Modifiers,
    type MonthCaptionProps,
    type OnSelectHandler,
} from 'react-day-picker'
import type { DatePickerProps } from '../types'
import { type PopoverProps } from '@mui/material'
import { useState } from 'react'
import { StyledCalendarPickerFooter } from './StyledCalendarPickerFooter'
import { CustomCaption } from './StyledCalendarPickerCaption'
import { StyledCalendarPickerSelectMonth } from './StyledCalendarPickerSelectMonth'
import { StyledCalendarPickerSelectYear } from './StyledCalendarPickerSelectYear'
import { enGB } from 'date-fns/locale'
import styles from './StyledCalendarPicker.module.scss'
import { startOfToday, endOfMonth } from 'date-fns'
import { buildDisabled } from '../helpers'

export const StyledDayPicker: React.FC<{
    datePickerProps: DatePickerProps
    popoverProps: PopoverProps
}> = ({ datePickerProps, popoverProps }) => {
    const {
        showOutsideDays = true,
        locale = enGB,
        numberOfMonths,
        disabledDays,
        onClear,
        title, // consume it here if you remove calendar picker will have tooltip with this title
        ...dayPickerPropsRest
    } = datePickerProps

    const { onClose } = popoverProps

    const startDate = datePickerProps.mode === 'range' ? datePickerProps.selected?.from : datePickerProps.selected

    const [month, setMonth] = useState<Date | undefined>(startDate || new Date())
    const isNb = locale.code === 'nb'
    const isOneMonthView = (numberOfMonths || 1) < 2

    const disallowPast = 'disallowPast' in datePickerProps ? datePickerProps.disallowPast : undefined
    const disallowFuture = 'disallowFuture' in datePickerProps ? datePickerProps.disallowFuture : undefined

    const today = startOfToday()
    const disabledMerged = buildDisabled(disabledDays, disallowPast, disallowFuture, today)

    const removeSelection = (e: React.MouseEvent) => {
        if (!datePickerProps.selected || !datePickerProps.onSelect) return

        const triggerDate = new Date()
        const modifiers = {} as Modifiers

        if (datePickerProps.mode === 'range') {
            const onSelectRange = datePickerProps.onSelect as OnSelectHandler<DateRange | undefined>

            onSelectRange(undefined, triggerDate, modifiers, e)
            return
        }

        const onSelectDate = datePickerProps.onSelect as OnSelectHandler<Date | undefined>

        onSelectDate(undefined, triggerDate, modifiers, e)
    }

    const handleMonthChange = (nextMonth: Date) => {
        setMonth(nextMonth)

        if (!datePickerProps.onSelect) return

        if (!datePickerProps.mode || datePickerProps.mode === 'single') {
            const currentSelected = datePickerProps.selected

            if (currentSelected instanceof Date) {
                const year = nextMonth.getFullYear()
                const monthIndex = nextMonth.getMonth()
                const day = currentSelected.getDate()

                const lastDayOfTargetMonth = endOfMonth(new Date(year, monthIndex, 1)).getDate()
                const safeDay = Math.min(day, lastDayOfTargetMonth)

                const newSelectedDate = new Date(currentSelected)
                newSelectedDate.setFullYear(year, monthIndex, safeDay)

                datePickerProps.onSelect(
                    newSelectedDate,
                    newSelectedDate,
                    {} as Modifiers,
                    {} as React.MouseEvent<Element, MouseEvent>,
                )
            }
        }
    }

    return (
        <DayPicker
            {...dayPickerPropsRest}
            disabled={disabledMerged}
            month={month}
            onMonthChange={handleMonthChange}
            captionLayout='dropdown'
            weekStartsOn={1}
            locale={locale}
            startMonth={new Date(datePickerProps.fromYear || 1900, 0)}
            endMonth={new Date(datePickerProps.toYear || 2100, 11)}
            data-test='calendar-picker'
            showWeekNumber
            showOutsideDays={showOutsideDays}
            fixedWeeks
            className={`${styles['styled-calendar-day-picker']} ${isNb ? styles['locale-nb'] : ''}`}
            classNames={{
                months: styles['months'],
                weeknumber: styles['weeknumber'],
                month: styles['month'],
                caption: styles['caption'],
                caption_label: styles['caption_label'],
                nav: styles['nav'],
                nav_button: styles['nav_button'],
                nav_button_previous: styles['nav_button_previous'],
                nav_button_next: styles['nav_button_next'],
                head_row: styles['head_row'],
                head_cell: styles['head_cell'],
                row: styles['row'],
                cell: styles['cell'],
                day: styles['day'],
                day_today: styles['day_today'],
                day_selected: styles['day_selected'],
                day_outside: styles['day_outside'],
                day_disabled: styles['day_disabled'],
                day_range_middle: styles['day_range_middle'],
                day_hidden: styles['day_hidden'],
                caption_end: isOneMonthView ? '' : styles['caption_end'],
            }}
            components={{
                MonthCaption: (props: MonthCaptionProps) => <CustomCaption {...props} onClose={onClose} />,
                MonthsDropdown: StyledCalendarPickerSelectMonth,
                YearsDropdown: StyledCalendarPickerSelectYear,
            }}
            footer={
                <StyledCalendarPickerFooter
                    onClose={onClose}
                    isNb={isNb}
                    selected={datePickerProps.selected}
                    removeSelection={removeSelection}
                    required={datePickerProps?.required}
                    setMonth={setMonth}
                    month={month}
                    onClear={onClear}
                />
            }
        />
    )
}
