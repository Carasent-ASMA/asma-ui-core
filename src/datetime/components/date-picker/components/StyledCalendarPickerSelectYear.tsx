import type { DropdownProps } from 'react-day-picker'
import { StyledFormControl } from 'src/datetime/shared-components/StyledFormControl'
import { StyledSelect } from 'src/datetime/shared-components/StyledSelect'
import { StyledSelectItem } from 'src/datetime/shared-components/StyledSelectItem'
import styles from './StyledCalendarPickerSelectPeriod.module.scss'
export function StyledCalendarPickerSelectYear(props: DropdownProps) {
    const { options = [], onChange, value, disabled, className, style, name } = props
    const ariaLabel = props['aria-label']

    return (
        <StyledFormControl style={{ width: '70px', marginLeft: '5px' }}>
            <StyledSelect
                dataTest='StyledCalendarPickerSelectYear'
                size='small'
                variant='standard'
                name={name}
                aria-label={ariaLabel}
                disabled={disabled}
                className={className}
                style={style}
                value={value ?? ''}
                onChange={(event: unknown) => onChange?.(event as React.ChangeEvent<HTMLSelectElement>)}
                MenuProps={{ className: styles['styled-calendar-picker-select-period-menu'] }}
            >
                {options.map((option) => (
                    <StyledSelectItem key={option.value} value={option.value} disabled={option.disabled}>
                        {option.label}
                    </StyledSelectItem>
                ))}
            </StyledSelect>
        </StyledFormControl>
    )
}
