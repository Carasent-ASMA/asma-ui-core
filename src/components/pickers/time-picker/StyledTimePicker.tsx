import { StyledInputField } from '../../inputs/input-field'
import { Popover, type PopoverOrigin } from '@mui/material'
import { ClockOutlineIcon } from 'src/components/data-display/icons/clock-outline-icon'
import clsx from 'clsx'
import { useToggleMenuVisibility } from 'src/hooks/useToggleMenuVisibility.hook'
import { format } from 'date-fns'

import { TimePickerBody } from './components/TimePickerBody'
import './StyledTimePicker.scss'
import { StyledButton } from '../../inputs/button'
import { Icon } from '@iconify/react'

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
    error?: boolean
    helperText?: string
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
    error,
    helperText,
}) => {
    const { anchorEl, open, handleClose, handleOpen } = useToggleMenuVisibility()

    return (
        <>
            <StyledInputField
                dataTest={dataTest}
                placeholder={placeholder}
                size='small'
                error={error}
                helperText={helperText}
                onClick={(e) => !disabled && handleOpen(e)}
                InputProps={{
                    endAdornment: <ClockOutlineIcon width={24} height={24} />,
                }}
                value={value ? format(value, 'HH:mm') : ''}
                sx={{
                    maxWidth: width || 130,
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
                <div className='flex my-3 justify-between'>
                    <StyledButton
                        variant='text'
                        onClick={() => {
                            onSelect(undefined)
                        }}
                        size='small'
                        disabled={!value}
                        dataTest='select-today'
                        className='!min-w-[40px] ml-2.5'
                        startIcon={<Icon icon='ph:eraser-duotone' width={24} height={24} />}
                    />
                    <StyledButton
                        size='small'
                        onClick={handleClose}
                        dataTest='select-time'
                        className='!min-w-[40px] mr-4'
                        startIcon={<Icon icon='bi:check-lg' width={20} height={20} />}
                    ></StyledButton>
                </div>
            </Popover>
        </>
    )
}
