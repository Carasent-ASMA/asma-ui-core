import { TimePicker } from '@mui/x-date-pickers'
import { useState, type FC } from 'react'
import { ClockOutlineIcon } from '../data-display/icons/clock-outline-icon'
import type { IStyledTimePickerProps } from './types'

export const StyledTimePicker: FC<IStyledTimePickerProps> = (props) => {
    const [open, setOpen] = useState(false)

    return (
        <TimePicker
            open={open}
            onClose={() => setOpen(false)}
            {...props}
            slots={{
                ...props.slots,
                openPickerIcon: ClockOutlineIcon,
            }}
            slotProps={{
                ...props.slotProps,
                openPickerButton: {
                    disableRipple: true,
                },
                textField: {
                    ...props.slotProps?.textField,
                    size: props.size,
                    onClick: () => setOpen(true),
                },
            }}
        />
    )
}
