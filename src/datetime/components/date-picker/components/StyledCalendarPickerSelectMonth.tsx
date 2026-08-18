import type { DropdownProps } from 'react-day-picker'

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()

import { StyledFormControl } from 'src/datetime/shared-components/StyledFormControl'
import { StyledSelect } from 'src/datetime/shared-components/StyledSelect'
import { StyledSelectItem } from 'src/datetime/shared-components/StyledSelectItem'
import styles from './StyledCalendarPickerSelectPeriod.module.scss'
export function StyledCalendarPickerSelectMonth(props: DropdownProps): JSX.Element {
    const { options = [], onChange, value, disabled, className, style, name } = props
    const ariaLabel = props['aria-label']

    return (
        <StyledFormControl style={{ marginLeft: '-2px', marginRight: '4px' }}>
            <StyledSelect
                dataTest='StyledCalendarPickerSelectMonth'
                size='small'
                variant='standard'
                // `StyledSelect` has no raw `aria-label` prop (it derives its own name from
                // `labelId`/`name`) — the `aria-label` react-day-picker passes in was being silently
                // dropped, leaving the trigger nameless (axe `button-name`). Route it through `name`,
                // which the field's own fallback already uses as its accessible-name source.
                name={ariaLabel ?? name}
                disabled={disabled}
                className={className}
                style={style}
                value={value ?? ''}
                onChange={(event: unknown) => onChange?.(event as React.ChangeEvent<HTMLSelectElement>)}
                MenuProps={{ className: styles['styled-calendar-picker-select-period-menu'] }}
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
