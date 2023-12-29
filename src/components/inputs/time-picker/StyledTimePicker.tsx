import { StyledInputField } from '../input-field'
import { Popover, type PopoverOrigin } from '@mui/material'
import { ClockOutlineIcon } from 'src/components/data-display/icons/clock-outline-icon'
import clsx from 'clsx'
import { useToggleMenuVisibility } from 'src/hooks/useToggleMenuVisibility.hook'
import { format } from 'date-fns'

import { TimePickerBody } from './components/TimePickerBody'
import './StyledTimePicker.scss'

export type StyledTimePickerProps = {
    placeholder?: string
    disabled?: boolean
    inputClassName?: string
    value?: Date
    onSelect: (date: Date | undefined) => void
    dataTest: string
    width?: number
    anchorOrigin?: PopoverOrigin
    transformOrigin?: PopoverOrigin
}

export const StyledTimePicker: React.FC<StyledTimePickerProps> = ({
    placeholder,
    disabled,
    inputClassName,
    value,
    onSelect,
    dataTest,
    width,
    anchorOrigin,
    transformOrigin,
}) => {
    const { anchorEl, open, handleClose, handleOpen } = useToggleMenuVisibility()

    return (
        <>
            <StyledInputField
                dataTest={dataTest}
                placeholder={placeholder}
                size='small'
                onClick={(e) => !disabled && handleOpen(e)}
                InputProps={{
                    endAdornment: <ClockOutlineIcon width={24} height={24} />,
                }}
                value={value ? format(value, 'HH:mm') : undefined}
                sx={{
                    maxWidth: width || 102,
                    width,
                    minWidth: width,
                }}
                disabled={disabled}
                className={clsx(inputClassName ? inputClassName : 'mb-2 pb-2')}
            />

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={
                    anchorOrigin || {
                        vertical: 'bottom',
                        horizontal: 'left',
                    }
                }
                transformOrigin={
                    transformOrigin || {
                        vertical: -5,
                        horizontal: 'left',
                    }
                }
            >
                <TimePickerBody dataTest={`${dataTest}-time-picker-body`} value={value} onSelect={onSelect} />
            </Popover>
        </>
    )
}
