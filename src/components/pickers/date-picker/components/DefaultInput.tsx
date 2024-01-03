import { CalendarBlankOutlineIcon } from 'src/components/data-display/icons/calendar-blank-outline-icon'
import { StyledInputField } from '../../../inputs/input-field'
import type { DatePickerProps } from '../types'
import { getValue } from '../helpers'

export const DefaultInput: React.FC<DatePickerProps & { onClick: (e: React.MouseEvent<HTMLDivElement>) => void }> = (
    props,
) => {
    const { dataTest, placeholder, disabled, onClick, inputClassName, onClear, allowClear, dateFormat } = props

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
        <StyledInputField
            dataTest={dataTest}
            placeholder={placeholder}
            size='small'
            onClick={(e) => !disabled && onClick(e)}
            InputProps={{
                endAdornment: <CalendarBlankOutlineIcon width={24} height={24} />,
            }}
            value={value}
            disabled={!!disabled}
            className={`${inputClassName}`}
            allowClear={allowClear}
            onClear={() => {
                onClear?.()
            }}
        />
    )
}
