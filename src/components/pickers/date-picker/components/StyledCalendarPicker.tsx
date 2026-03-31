import { DayPicker, type DropdownProps } from 'react-day-picker'

import type { DatePickerProps } from '../types'
import { Popover, type PopoverProps } from '@mui/material'
import { useState } from 'react'
import { StyledCalendarPickerFooter } from './StyledCalendarPickerFooter'
import { StyledCalendarPickerSelectMonth } from './StyledCalendarPickerSelectMonth'
import { StyledCalendarPickerSelectYear } from './StyledCalendarPickerSelectYear'
import { enGB } from 'date-fns/locale'
import style from './StyledCalendarPicker.module.scss'
import 'react-day-picker/dist/style.css'
export const StyledCalendarPicker: React.FC<{
    datePickerProps: DatePickerProps
    popoverProps: PopoverProps
    positionAbove: boolean
}> = ({ datePickerProps, popoverProps, positionAbove }) => {
    const { showOutsideDays = true, locale, selected, numberOfMonths, disabledDays, onClear } = datePickerProps
    const { open, anchorEl, onClose } = popoverProps
    const [month, setMonth] = useState<Date | undefined>(new Date(Date.now()))
    //
    const isNb = locale?.code === 'nb'
    const isOneMonthView = (numberOfMonths || 1) < 2
    //
    const removeSelection = (e: React.MouseEvent) => {
        if (!selected || !datePickerProps.onSelect) return
        ;(
            datePickerProps.onSelect as (
                value: undefined,
                triggerDate: Date,
                modifiers: Record<string, boolean>,
                event: React.MouseEvent,
            ) => void
        )(undefined, new Date(Date.now()), {}, e)
    }
    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: positionAbove ? 'top' : 50,
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: positionAbove ? 'bottom' : 'top',
                horizontal: 'left',
            }}
        >
            <DayPicker
                disabled={disabledDays}
                month={month}
                onMonthChange={(e) => {
                    setMonth(e)
                }}
                captionLayout='dropdown'
                locale={locale ? locale : enGB}
                fromYear={2000}
                toYear={2050}
                data-test={'calendar-picker'}
                showWeekNumber
                showOutsideDays={showOutsideDays}
                fixedWeeks
                className={style['styled-calendar-day-picker']}
                classNames={{
                    months: style['months'],
                    month: style['month'],
                    caption: style['caption'],
                    caption_label: style['caption_label'],
                    nav: style['nav'],
                    nav_button: style['nav_button'],
                    nav_button_previous: style['nav_button_previous'],
                    nav_button_next: style['nav_button_next'],
                    head_row: style['head_row'],
                    head_cell: style['head_cell'],
                    row: style['row'],
                    cell: style['cell'],
                    day: style['day'],
                    day_today: style['day_today'],
                    day_selected: style['day_selected'],
                    day_outside: style['day_outside'],
                    day_disabled: style['day_disabled'],
                    day_range_middle: style['day_range_middle'],
                    day_hidden: style['day_hidden'],
                    caption_end: isOneMonthView ? '' : style['caption_end'],
                }}
                components={{
                    MonthsDropdown: (props: DropdownProps) => <StyledCalendarPickerSelectMonth {...props} />,
                    YearsDropdown: (props: DropdownProps) => <StyledCalendarPickerSelectYear {...props} />,
                }}
                footer={
                    <StyledCalendarPickerFooter
                        onClose={onClose}
                        isNb={isNb}
                        selected={selected}
                        removeSelection={removeSelection}
                        setMonth={setMonth}
                        month={month}
                        onClear={onClear}
                    />
                }
                {...datePickerProps}
            />
        </Popover>
    )
}
