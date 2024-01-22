import { StyledInputField } from '../../../inputs/input-field'
import type { DatePickerProps } from '../types'
import { getValue } from '../helpers'
import { CalendarRangeIcon } from 'src/components/data-display/icons'
import { cn } from 'src/helpers/cn'

export const DatePickerInputSingle: React.FC<
    DatePickerProps & { onClick: (e: React.MouseEvent<HTMLDivElement>) => void }
> = (props) => {
    const { dataTest, placeholder, disabled, onClick, inputClassName, onClear, allowClear, dateFormat } = props

    if (props.mode !== 'single') return null

    return (
        <StyledInputField
            dataTest={dataTest}
            placeholder={placeholder}
            size='small'
            onClick={(e) => !disabled && onClick(e)}
            InputProps={{
                endAdornment: <CalendarRangeIcon width={24} height={24} />,
            }}
            value={getValue(props.selected, dateFormat)}
            disabled={!!disabled}
            className={cn(`w-36 ${inputClassName}`)}
            allowClear={allowClear}
            onClear={() => {
                onClear?.()
            }}
            label={props.label}
        />
    )
}
