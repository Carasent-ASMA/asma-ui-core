import { StyledInputField } from '../../../inputs/input-field'
import { getValue } from '../helpers'
import type { DatePickerProps } from '../types'

export const RangeInput: React.FC<DatePickerProps & { onClick: (e: React.MouseEvent<HTMLDivElement>) => void }> = (
    props,
) => {
    const { dataTest, className, inputClassName, disabled, placeholderFrom, placeholderTo, dateFormat, onClick } = props

    if (props.mode !== 'range') return null
    const value_from: string | undefined = getValue(props.selected?.from, dateFormat)
    const value_to: string | undefined = getValue(props.selected?.to, dateFormat)

    return (
        <div
            data-test={dataTest}
            className={`${className} ${
                disabled ? 'cursor-default text-[var(--colors-gray-300)]' : 'cursor-pointer'
            } inline-flex gap-1 w-fit items-center`}
            onClick={(e) => !disabled && onClick(e)}
        >
            <StyledInputField
                autoComplete={'off'}
                size='small'
                dataTest='styled-date-picker-input-range-from'
                placeholder={placeholderFrom}
                value={value_from}
                disabled={!!disabled}
                className={`${inputClassName} w-[90px] `}
            />
            -
            <StyledInputField
                autoComplete={'off'}
                dataTest='styled-date-picker-input-range-to'
                size='small'
                placeholder={placeholderTo}
                value={value_to}
                disabled={!!disabled}
                className={`${inputClassName} w-[90px]`}
            />
        </div>
    )
}
