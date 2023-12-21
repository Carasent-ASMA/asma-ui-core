import { DayPicker, type CaptionProps, type DropdownProps } from 'react-day-picker'
import { ChevronLeftIcon, ChevronRightIcon } from 'asma-core-ui'

import type { DatePickerProps } from '../types'
import { Popover, type PopoverProps } from '@mui/material'
import { useState } from 'react'
import { StyledCalendarPickerFooter } from './StyledCalendarPickerFooter'
import { CustomCaption } from './StyledCalendarPickerCaption'
import { StyledCalendarPickerSelectMonth } from './StyledCalendarPickerSelectMonth'
import { StyledCalendarPickerSelectYear } from './StyledCalendarPickerSelectYear'

import 'react-day-picker/dist/style.css'
export const StyledCalendarPicker: React.FC<{
    datePickerProps: DatePickerProps
    popoverProps: PopoverProps
    positionAbove: boolean
}> = ({ datePickerProps, popoverProps, positionAbove }) => {
    const { showOutsideDays = true, locale, selected, numberOfMonths } = datePickerProps
    const { open, anchorEl, onClose } = popoverProps
    const [month, setMonth] = useState<Date | undefined>(new Date(Date.now()))
    //
    const isNb = locale?.code === 'nb'
    const isOneMonthView = (numberOfMonths || 1) < 2
    //
    const removeSelection = (e: React.MouseEvent) =>
        selected && datePickerProps?.onSelect?.(undefined, new Date(Date.now()), {}, e)

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
            {/* <StyledCalendarPicker {...props} disabled={disabledDays} /> */}
            <DayPicker
                month={month}
                onMonthChange={(e) => {
                    setMonth(e)
                }}
                captionLayout='dropdown'
                fromYear={2000}
                toYear={2050}
                data-test={'calendar-picker'}
                showWeekNumber
                showOutsideDays={showOutsideDays}
                fixedWeeks
                className='font-roboto'
                classNames={{
                    months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                    month: 'space-y-4',
                    caption: 'flex justify-center pt-1 relative items-center',
                    caption_label: 'text-base text-[var(--colors-gray-700)] font-medium',
                    nav: 'space-x-1 flex items-center',
                    nav_button:
                        'h-7 w-7 flex text-[var(--colors-gray-700)] items-center justify-center border border-[var(--colors-gray-500)] hover:bg-[var(--colors-gray-50)] rounded',
                    nav_button_previous: 'absolute left-1',
                    nav_button_next: 'absolute right-1',
                    head_row: 'flex text-sm  cursor-pointer',
                    head_cell: 'text-[var(--colors-gray-600)] w-9 cursor-pointer',
                    row: 'flex w-full mt-2',
                    cell: 'text-sm w-9 text-[var(--colors-gray-800)]  relative [&:has([aria-selected])]:bg-gama-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md ',
                    day: 'h-10 w-9 p-0 font-normal rounded-md hover:bg-[var(--colors-gray-50)] focus-visible:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-gama-500 focus-visible:z-50',
                    day_selected: '!bg-gama-500 text-white hover:bg-gama-500 hover:text-white',
                    day_today: ' text-gama-700 text-base bg-gray-100 font-bold  hover:bg-gama-50',
                    day_outside: 'text-[var(--colors-gray-400)]',
                    day_disabled: 'text-[var(--colors-gray-400)]',
                    day_range_middle: 'aria-selected:bg-gama-50 aria-selected:text-[var(--colors-gray-800)]',
                    day_hidden: 'invisible',
                    caption_end: isOneMonthView
                        ? ''
                        : '[&_tfoot]:hidden [&_.rdp-custom-caption]:opacity-0 [&_.rdp-custom-caption]:pointer-events-none',
                }}
                components={{
                    IconLeft: () => <ChevronLeftIcon className='h-4 w-4 ' />,
                    IconRight: () => <ChevronRightIcon className='h-4 w-4' />,
                    Caption: (props: CaptionProps) => (
                        <CustomCaption {...props} setMonth={setMonth} month={month} isNb={isNb} />
                    ),
                    Dropdown: (props: DropdownProps) => {
                        return props.name === 'months' ? (
                            <StyledCalendarPickerSelectMonth {...props} />
                        ) : (
                            <StyledCalendarPickerSelectYear {...props} />
                        )
                    },
                }}
                footer={
                    <StyledCalendarPickerFooter
                        onClose={onClose}
                        isNb={isNb}
                        selected={selected}
                        removeSelection={removeSelection}
                    />
                }
                {...datePickerProps}
            />
        </Popover>
    )
}
