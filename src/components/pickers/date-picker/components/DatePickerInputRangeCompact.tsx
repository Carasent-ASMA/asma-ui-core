import { StyledInputField } from '../../../inputs/input-field'
import { getValue } from '../helpers'
import type { DatePickerProps } from '../types'
import { OutlineCalendarMonth } from 'src/components/icons'
import clsx from 'clsx'
import style from './DatePickerInputRangeCompact.module.scss'

export const DatePickerInputRangeCompact: React.FC<
    DatePickerProps & { onClick: (e: React.MouseEvent<HTMLDivElement>) => void }
> = (props) => {
    const {
        dataTest,
        className,
        inputClassName,
        disabled,
        placeholderFrom,
        placeholderTo,
        dateFormat,
        onClick,
        labelFrom,
        labelTo,
    } = props

    if (props.mode !== 'range') return null
    const value_from: string | undefined = getValue(props.selected?.from, dateFormat)
    const value_to: string | undefined = getValue(props.selected?.to, dateFormat)

    return (
        <div
            data-test={dataTest}
            className={clsx(className, style['styled-date-picker-input-range-compact'], disabled && style['range-compact-disabled'])}
            onClick={(e) => !disabled && onClick(e)}
        >
            <StyledInputField
                label={labelFrom}
                autoComplete={'off'}
                size='small'
                dataTest='styled-date-picker-input-range-from'
                placeholder={placeholderFrom}
                value={value_from}
                disabled={!!disabled}
                className={inputClassName}
                style={{ width: '144px' }}
                InputProps={{
                    endAdornment: <OutlineCalendarMonth width={24} height={24} />,
                }}
            />
            <StyledInputField
                label={labelTo}
                autoComplete={'off'}
                dataTest='styled-date-picker-input-range-to'
                size='small'
                placeholder={placeholderTo}
                value={value_to}
                disabled={!!disabled}
                className={inputClassName}
                style={{ width: '144px' }}
                InputProps={{
                    endAdornment: <OutlineCalendarMonth width={24} height={24} />,
                }}
            />
        </div>
    )
}
