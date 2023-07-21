import { DatePicker } from '@mui/x-date-pickers'
import { useState } from 'react'
import type { IStyledDatePickerProps } from './types'
import { CalendarBlankOutlineIcon } from '../data-display/icons/calendar-blank-outline-icon/CalendarBlankOutlineIcon'

import './StyledDatePicker.scss'

export const StyledDatePicker: React.FC<IStyledDatePickerProps> = ({ actions, placeholder, size, ...rest }) => {
    const [open, setOpen] = useState(false)

    return (
        <DatePicker
            open={open}
            onClose={() => setOpen(false)}
            {...rest}
            slots={{
                ...rest.slots,
                openPickerIcon: CalendarBlankOutlineIcon,
            }}
            slotProps={{
                ...rest.slotProps,
                popper: {
                    className: 'StyledDatePicker-popper',
                },
                openPickerButton: {
                    disableRipple: true,
                },
                actionBar: { actions: actions ? actions : ['today'], className: 'justify-center pt-0' },
                day: {
                    classes: {
                        root: 'rounded-sm border-none w-7 h-6 m-1',
                        selected: 'bg-gama-500 text-delta-900',
                        today: 'bg-gama-600 !text-white',
                    },
                },
                leftArrowIcon: {
                    className: 'text-delta-600 w-6',
                },
                rightArrowIcon: {
                    className: 'text-delta-600 w-6',
                },
                nextIconButton: {
                    disableRipple: true,
                    className: 'px-0',
                },
                previousIconButton: {
                    disableRipple: true,
                    className: 'px-0',
                },
                textField: {
                    ...rest.slotProps?.textField,
                    placeholder: placeholder,
                    size: size,
                    onClick: () => setOpen(true),
                },
            }}
        />
    )
}
