import { getHours, getMinutes, set } from 'date-fns'
import clsx from 'clsx'
import type { StyledTimePickerProps } from '../types'
import styles from '../StyledTimePicker.module.scss'
export type TimePickerColumnProps = Omit<
    StyledTimePickerProps,
    'placeholder' | 'disabled' | 'inputClassName' | 'dataTest'
> & {
    type: 'hours' | 'minutes'
}

export const TimePickerColumn: React.FC<TimePickerColumnProps> = ({ type, value, onSelect }) => {
    const now = new Date()
    const isHours = type === 'hours'
    // 12 to show minutes as 05,10,15,20
    const size = isHours ? 24 : 12
    const currentTime = isHours ? now.getHours() : now.getMinutes()

    return (
        <div className={styles['styled-time-picker-root_column']}>
            {new Array(size).fill(null).map((_, _index) => {
                //  _index * 5 for minutes column
                const idx = isHours ? _index : _index * 5
                const isSelected = value && idx === (isHours ? getHours(value) : getMinutes(value))
                const isNow = currentTime == idx

                return (
                    // Native <button>: was a <div role='button'> with no keyboard listener/tabIndex,
                    // making the whole hour/minute grid unreachable by keyboard. Visible text content
                    // (the padded number) is already the accessible name — no aria-label needed.
                    <button
                        key={idx}
                        type='button'
                        className={clsx(
                            'border-0',
                            styles['styled-time-picker-root_cell'],
                            isNow && styles['styled-time-picker-root_cell__cell-now'],
                            isSelected && styles['styled-time-picker-root_cell__cell-selected'],
                        )}
                        onClick={() => {
                            onSelect(set(value ?? new Date(), isHours ? { hours: idx } : { minutes: idx }))
                        }}
                    >
                        {idx.toString().padStart(2, '0')}
                    </button>
                )
            })}
        </div>
    )
}
