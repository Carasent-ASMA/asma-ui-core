import { StyledInputField } from '../input-field'
import { Popover } from '@mui/material'
import { ClockOutlineIcon } from 'src/components/data-display/icons/clock-outline-icon'
import clsx from 'clsx'
import { useToggleMenuVisibility } from 'src/components/table/useToggleMenuVisibility'
import { format } from 'date-fns'

import { TimePickerBody } from './components/TimePickerBody'

export type StyledTimePickerProps = {
    placeholder?: string
    disabled?: boolean
    inputClassName?: string
    value?: Date
    onSelect: (date: Date | undefined) => void
}

export const StyledTimePicker: React.FC<StyledTimePickerProps> = ({
    placeholder,
    disabled,
    inputClassName,
    value,
    onSelect,
}) => {
    const { anchorEl, open, handleClose, handleOpen } = useToggleMenuVisibility()

    return (
        <>
            <StyledInputField
                placeholder={placeholder}
                size='small'
                onClick={(e) => !disabled && handleOpen(e)}
                InputProps={{
                    endAdornment: <ClockOutlineIcon width={24} height={24} />,
                }}
                value={value ? format(value, 'HH:mm') : undefined}
                sx={{ maxWidth: 110 }}
                disabled={disabled}
                className={clsx(inputClassName, 'my-2 py-2')}
            />

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: -5,
                    horizontal: 'center',
                }}
            >
                <TimePickerBody value={value} onSelect={onSelect} />
            </Popover>
        </>
    )
}
