import type { DropdownProps } from 'react-day-picker'
import { capitalize } from 'lodash-es'

import { StyledFormControl } from 'src/datetime/shared-components/StyledFormControl'
import { StyledSelect } from 'src/datetime/shared-components/StyledSelect'
import { StyledSelectItem } from 'src/datetime/shared-components/StyledSelectItem'
import styles from './StyledCalendarPickerSelectPeriod.module.scss'
export function StyledCalendarPickerSelectMonth(props: DropdownProps): JSX.Element {
    const { options = [], onChange, value, disabled, className, style, name } = props
    const ariaLabel = props['aria-label']

    return (
        <StyledFormControl style={{ marginLeft: '-2px', marginRight: '8px' }}>
            <StyledSelect
                dataTest='StyledCalendarPickerSelectMonth'
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
                sx={{
                    '&::before': {
                        borderBottom: 'none',
                    },
                    '&:hover::before': {
                        borderBottom: 'none',
                    },
                    '&:hover:not(.Mui-disabled, .Mui-error)::before': {
                        borderBottom: 'none',
                    },
                    '&:focus::before': {
                        borderBottom: 'none',
                    },
                }}
            >
                {options.map((option) => (
                    <StyledSelectItem key={option.value} value={option.value} disabled={option.disabled}>
                        {capitalize(option.label)}
                    </StyledSelectItem>
                ))}
            </StyledSelect>
        </StyledFormControl>
    )
}
