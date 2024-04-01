import { StyledInputField } from '../../../inputs/input-field'
import type { DatePickerProps } from '../types'
import { getValue } from '../helpers'
import { OutlineCalendarMonth } from 'src/components/icons'

export const DatePickerInputSingle: React.FC<
    DatePickerProps & { onClick: (e: React.MouseEvent<HTMLDivElement>) => void }
> = (props) => {
    const {
        dataTest,
        placeholder,
        disabled,
        onClick,
        inputClassName,
        onClear,
        allowClear,
        dateFormat,
        error = false,
        helperText,
    } = props

    if (props.mode !== 'single') return null

    return (
        <StyledInputField
            dataTest={dataTest}
            placeholder={placeholder}
            size='small'
            onClick={(e) => !disabled && onClick(e)}
            InputProps={{
                endAdornment: <OutlineCalendarMonth width={24} height={24} />,
            }}
            value={getValue(props.selected, dateFormat)}
            disabled={!!disabled}
            className={inputClassName}
            style={{ width: '144px' }}
            allowClear={allowClear}
            onClear={() => {
                onClear?.()
            }}
            label={props.label}
            error={error}
            helperText={helperText}
        />
    )
}
