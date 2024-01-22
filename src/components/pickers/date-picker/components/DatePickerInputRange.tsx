import { StyledInputField } from '../../../inputs/input-field'
import type { DatePickerProps } from '../types'
import { getValue } from '../helpers'
import { CalendarRangeIcon } from 'src/components/data-display/icons'
import { cn } from 'src/helpers/cn'

export const DatePickerInputRange: React.FC<
    DatePickerProps & { onClick: (e: React.MouseEvent<HTMLDivElement>) => void }
> = (props) => {
    const { dataTest, placeholder, disabled, onClick, inputClassName, onClear, allowClear, dateFormat, label } = props

    if (props.mode !== 'range') return null

    const value_from: string | undefined = getValue(props.selected?.from, dateFormat)
    const value_to: string | undefined = getValue(props.selected?.to, dateFormat)

    const value = props.selected?.from ? (props.selected.to ? `${value_from} - ${value_to}` : value_from) : ''

    return (
        <StyledInputField
            dataTest={dataTest}
            placeholder={placeholder}
            label={label}
            size='small'
            onClick={(e) => !disabled && onClick(e)}
            InputProps={{
                endAdornment: <CalendarRangeIcon width={24} height={24} />,
            }}
            value={value}
            disabled={!!disabled}
            className={cn(`w-60 ${inputClassName}`)}
            allowClear={allowClear}
            onClear={() => {
                onClear?.()
            }}
        />
    )
}
