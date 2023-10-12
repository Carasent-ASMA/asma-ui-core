import 'react-day-picker/dist/style.css'
import { format } from 'date-fns'
import { Popover } from '@mui/material'
import { useState } from 'react'
import { CalendarBlankOutlineIcon } from '../../data-display/icons/calendar-blank-outline-icon'

import { type CalendarProps, StyledCalendarPicker } from './StyledCalendarPicker'
import { StyledInputField } from '../input-field'

type CommonDatePickerProps = {
    dateFormat?: string
    className?: string
    inputClassName?: string
} & CalendarProps

type CompactRangeProps = {
    mode: 'range'
    compact: true
    placeholderFrom?: string
    placeholderTo?: string

    placeholder?: never
}

type DefaultRangeProps = {
    mode: 'range'
    compact?: false
    placeholder?: string

    placeholderFrom?: never
    placeholderTo?: never
}

type DefaultSingleProps = {
    mode: 'single'
    placeholder?: string

    compact?: never
    placeholderFrom?: never
    placeholderTo?: never
}

export type DatePickerProps = CommonDatePickerProps & (CompactRangeProps | DefaultRangeProps | DefaultSingleProps)

export const StyledDatePicker = ({
    placeholder = '',
    placeholderFrom = '',
    placeholderTo = '',
    compact,
    dateFormat,
    className,
    inputClassName,
    disabled,
    ...props
}: DatePickerProps) => {
    const [anchor, setAnchor] = useState<HTMLDivElement | null>(null)
    const [positionAbove, setPositionAbove] = useState(false)
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchor(event.currentTarget)

        const windowHeight = window.innerHeight
        const inputRect = event.currentTarget.getBoundingClientRect()
        const spaceAbove = inputRect.top
        const spaceBelow = windowHeight - inputRect.bottom

        if (spaceBelow < 300 && spaceAbove > spaceBelow) {
            setPositionAbove(true)
        } else {
            setPositionAbove(false)
        }
    }

    const handleClose = () => {
        setAnchor(null)
    }
    const open = Boolean(anchor)

    const getValue = (date?: Date, dateFormat = 'dd.MM.yy') => {
        return date ? format(date, dateFormat) : ''
    }

    let value: string | undefined = ''
    let value_from: string | undefined = ''
    let value_to: string | undefined = ''

    if (props.mode === 'range') {
        value_from = getValue(props.selected?.from, dateFormat)

        value_to = getValue(props.selected?.to, dateFormat)

        value = props.selected?.from ? (props.selected.to ? `${value_from} - ${value_to}` : value_from) : ''
    } else {
        value = getValue(props.selected, dateFormat)
    }

    return (
        <>
            {compact && props.mode === 'range' ? (
                <div
                    className={`${className} ${
                        disabled ? 'cursor-default text-[var(--colors-gray-300)]' : 'cursor-pointer'
                    } inline-flex gap-1 w-fit items-center`}
                    onClick={(e) => !disabled && handleClick(e)}
                >
                    <StyledInputField
                        size='small'
                        placeholder={placeholderFrom}
                        value={value_from}
                        disabled={!!disabled}
                        className={`${inputClassName}  w-28`}
                    />
                    -
                    <StyledInputField
                        size='small'
                        placeholder={placeholderTo}
                        value={value_to}
                        disabled={!!disabled}
                        className={`${inputClassName} w-28`}
                    />
                </div>
            ) : (
                <StyledInputField
                    placeholder={placeholder}
                    size='small'
                    onClick={(e) => !disabled && handleClick(e)}
                    InputProps={{
                        endAdornment: <CalendarBlankOutlineIcon width={24} height={24} />,
                    }}
                    value={value}
                    disabled={!!disabled}
                    className={`${inputClassName}`}
                />
            )}
            <Popover
                open={open}
                anchorEl={anchor}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: positionAbove ? 'top' : 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: positionAbove ? 'bottom' : 'top',
                    horizontal: 'center',
                }}
            >
                <StyledCalendarPicker {...props} />
            </Popover>
        </>
    )
}
