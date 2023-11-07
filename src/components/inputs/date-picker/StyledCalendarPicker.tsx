import { DayPicker } from 'react-day-picker'
import { ChevronLeftIcon, ChevronRightIcon } from 'asma-core-ui'
import 'react-day-picker/dist/style.css'
export type CalendarProps = React.ComponentProps<typeof DayPicker>

export const StyledCalendarPicker = ({ dataTest, showOutsideDays = true, ...props }: CalendarProps & { dataTest?: string }) => {
    return (
        <DayPicker
            data-test={dataTest}
            showOutsideDays={showOutsideDays}
            classNames={{
                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month: 'space-y-4',
                caption: 'flex justify-center pt-1 relative items-center',
                caption_label: 'text-sm text-[var(--colors-gray-700)] font-medium',
                nav: 'space-x-1 flex items-center',
                nav_button:
                    'h-7 w-7 flex text-[var(--colors-gray-700)] items-center justify-center border border-[var(--colors-gray-500)] hover:bg-[var(--colors-gray-50)] rounded',
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                head_cell: 'text-[var(--colors-gray-600)] rounded-md w-9 font-normal text-[0.8rem]',
                row: 'flex w-full mt-2',
                cell: 'text-center text-sm text-[var(--colors-gray-800)] p-0 relative [&:has([aria-selected])]:bg-gama-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md ',
                day: 'h-9 w-9 p-0 font-normal rounded-md hover:bg-[var(--colors-gray-50)] focus-visible:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-gama-500 focus-visible:z-50',
                day_selected: 'bg-gama-500 text-white hover:bg-gama-500 hover:text-white',
                day_today: 'bg-gama-50 hover:bg-gama-50',
                day_outside: 'text-[var(--colors-gray-400)]',
                day_disabled: 'text-[var(--colors-gray-400)]',
                day_range_middle: 'aria-selected:bg-gama-50 aria-selected:text-[var(--colors-gray-800)]',
                day_hidden: 'invisible',
            }}
            components={{
                IconLeft: () => <ChevronLeftIcon className='h-4 w-4' />,
                IconRight: () => <ChevronRightIcon className='h-4 w-4' />,
            }}
            {...props}
        />
    )
}
