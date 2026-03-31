import type { DropdownProps } from 'react-day-picker'
import { StyledFormControl } from 'src/components/miscellaneous/StyledFormControl'
import { StyledSelect, StyledSelectItem } from '../../../inputs/select'
import { capitalize } from 'lodash-es'
import style from './StyledCalendarPickerSelectPeriod.module.scss'

export const StyledCalendarPickerSelectMonth: React.FC<DropdownProps> = (props) => {
    const selectedOptions = props.options ?? []

    return (
        <StyledFormControl style={{ width: '105px', marginLeft: '-5px' }}>
            <StyledSelect
                dataTest='StyledCalendarPickerSelectMonth'
                size='small'
                variant='standard'
                value={String(props.value ?? '')}
                onChange={(e) => {
                    props.onChange?.({
                        target: { value: Number(e.target.value) },
                    } as unknown as React.ChangeEvent<HTMLSelectElement>)
                }}
                MenuProps={{ className: style['styled-calendar-picker-select-period-menu'] }}
            >
                {selectedOptions?.map((month) => (
                    <StyledSelectItem key={month.value} value={String(month.value)} disabled={month.disabled}>
                        {capitalize(month.label)}
                    </StyledSelectItem>
                ))}
            </StyledSelect>
        </StyledFormControl>
    )
}
