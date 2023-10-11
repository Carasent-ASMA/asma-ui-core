import 'react-day-picker/dist/style.css'
import { format } from 'date-fns'
import { Popover } from '@mui/material'
import { type FC, useState } from 'react'

import { CalendarBlankOutlineIcon } from '../../data-display/icons/calendar-blank-outline-icon'

import { type CalendarProps, StyledCalendarPicker } from './StyledCalendarPicker'
import { StyledInput } from '../input'

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
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchor(event.currentTarget)
    }
    const handleClose = () => {
        setAnchor(null)
    }
    const open = Boolean(anchor)

    const getValue = (date?: Date, dateFormat = 'dd.MM.yy', placeholder?: string) => {
        return date ? format(date, dateFormat) : placeholder
    }

    let value: string | undefined = ''
    let value_from: string | undefined = ''
    let value_to: string | undefined = ''

    if (props.mode === 'range') {
        value_from = getValue(props.selected?.from, dateFormat, placeholderFrom)

        value_to = getValue(props.selected?.to, dateFormat, placeholderTo)

        value = props.selected?.from ? (props.selected.to ? `${value_from} - ${value_to}` : value_from) : placeholder
    } else {
        value = getValue(props.selected, dateFormat, placeholder)
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
                    <Input
                        value={value_from}
                        disabled={!!disabled}
                        selected={!!props.selected?.from}
                        className={`${inputClassName} ${props.selected?.from ? 'p-2' : 'py-2 px-4'} w-20`}
                    />
                    -
                    <Input
                        value={value_to}
                        disabled={!!disabled}
                        selected={!!props.selected?.to}
                        className={`${inputClassName} ${props.selected?.to ? 'p-2' : 'py-2 px-4'} w-20`}
                    />
                </div>
            ) : (
                <StyledInput
                    onClick={(e) => !disabled && handleClick(e)}
                    endIcon={<CalendarBlankOutlineIcon className={`mr-2 h-6 w-6 ${disabled && 'cursor-default'}`} />}
                    value={value}
                    disabled={!!disabled}
                    className={`${inputClassName} p-0 w-full border-none`}
                />
            )}
            <Popover
                open={open}
                anchorEl={anchor}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <StyledCalendarPicker {...props} />
            </Popover>
        </>
    )
}

const Input: FC<{ value?: string; disabled: boolean; selected: boolean; className?: string }> = ({
    value,
    disabled,
    selected,
    className,
}) => {
    return (
        <input
            value={value}
            readOnly
            className={`${className} ${
                disabled
                    ? 'border-[var(--colors-gray-300)] !text-[var(--colors-gray-300)] cursor-default'
                    : `${
                          selected ? 'text-[var(--colors-gray-800)]' : 'text-[var(--colors-gray-500)]'
                      }  border-[var(--colors-gray-500)] cursor-pointer`
            } rounded text-sm font-normal border border-solid outline-none`}
        />
    )
}
