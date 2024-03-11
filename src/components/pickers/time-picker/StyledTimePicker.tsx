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
import { useState, type ChangeEvent } from 'react'

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
    label?: string
    locale?: 'no' | 'en'
}

// const isNb = locale?.code === 'nb'
const getTimeFromValue = (value: string) => {
    const parts = value.split(':')
    const h = Number(parts[0])
    const m = Number(parts[1])

    const isValid = parts[0]?.length == 2 && parts[1]?.length == 2 && h >= 0 && h <= 23 && m >= 0 && m <= 59

    if (isValid) {
        const now = new Date()
        now.setHours(h)
        now.setMinutes(m)

        return now
    }

    return null
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
    label,
    locale = 'en',
}) => {
    const { anchorEl, open, handleClose, handleOpen } = useToggleMenuVisibility()

    const [localValue, setLocalValue] = useState(value ? format(value, 'HH:mm') : '')
    const [isValidTime, setIsValidTime] = useState(true)

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const nextValue = e.target.value

        setLocalValue(nextValue)

        const validTime = getTimeFromValue(nextValue)

        if (validTime) {
            onSelect(validTime)
        } else {
            onSelect(undefined)
        }

        setIsValidTime(!!validTime)
    }

    const handleSelect = (value: Date | undefined) => {
        onSelect(value)
        setLocalValue(value ? format(value, 'HH:mm') : '')
        setIsValidTime(true)
    }

    const handleClear = () => {
        onSelect(undefined)
        setLocalValue('')
        setIsValidTime(true)
    }

    return (
        <>
            <StyledInputField
                name='password'
                autoComplete='off'
                type='text'
                dataTest={dataTest}
                placeholder={placeholder}
                size='small'
                error={!isValidTime || error}
                helperText={
                    <HelperText isValidTime={isValidTime} error={error} localization={locale} helperText={helperText} />
                }
                onClick={(e) => !disabled && handleOpen(e)}
                onChange={handleChange}
                InputProps={{
                    endAdornment: (
                        <ClockOutlineIcon width={24} height={24} onClick={(e) => !disabled && handleOpen(e)} />
                    ),
                }}
                value={localValue}
                sx={{
                    maxWidth: width || 130,
                    width,
                    minWidth: width,
                }}
                disabled={disabled}
                className={clsx(inputClassName ? inputClassName : 'mb-2 pb-2')}
                label={label}
            />

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={
                    anchorOrigin || {
                        vertical: 'bottom',
                        horizontal: 0,
                    }
                }
                transformOrigin={
                    transformOrigin || {
                        vertical: -8,
                        horizontal: 'left',
                    }
                }
            >
                <TimePickerBody dataTest={`${dataTest}-time-picker-body`} value={value} onSelect={handleSelect} />
                <div className='flex my-3 justify-between'>
                    <StyledButton
                        variant='text'
                        onClick={handleClear}
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

export const HelperText: React.FC<{
    isValidTime: boolean
    error?: boolean
    localization: 'en' | 'no'
    helperText?: string
}> = ({ isValidTime, error = false, localization = 'en', helperText }) => {
    if (isValidTime && !error) return null

    let errorText = helperText

    const enString = 'Not valid'

    const noString = 'Ikke gyldig'

    if (!isValidTime) errorText = localization === 'en' ? enString : noString

    return <>{errorText}</>
}
