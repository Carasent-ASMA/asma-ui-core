import { getHours, getMinutes, set } from 'date-fns'
import clsx from 'clsx'
import type { StyledTimePickerProps } from '../types'
import styles from '../StyledTimePicker.module.scss'
import { clampToMinTime, isHourDisabled, isMinuteDisabled } from '../helpers/minTime'
export type TimePickerColumnProps = Omit<
    StyledTimePickerProps,
    'placeholder' | 'disabled' | 'inputClassName' | 'dataTest'
> & {
    type: 'hours' | 'minutes'
}

export const TimePickerColumn: React.FC<TimePickerColumnProps> = ({ type, value, onSelect, minTime }) => {
    const now = new Date()
    const isHours = type === 'hours'
    // A minute click keeps the hour of `value ?? new Date()` (see onClick), so that hour gates the minutes.
    const hourForMinutes = getHours(value ?? now)
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
                const isDisabled = isHours ? isHourDisabled(idx, minTime) : isMinuteDisabled(hourForMinutes, idx, minTime)

                return (
                    // Native <button>: was a <div role='button'> with no keyboard listener/tabIndex,
                    // making the whole hour/minute grid unreachable by keyboard. Visible text content
                    // (the padded number) is already the accessible name — no aria-label needed.
                    <button
                        key={idx}
                        type='button'
                        // Native `disabled`: skipped by Tab, announced as unavailable, and never fires onClick.
                        disabled={isDisabled}
                        // Stable hook for the scroll-into-view effect in TimePickerBody — CSS-module
                        // class names are hashed at build time, so they can't be queried literally.
                        data-cell={isSelected ? 'selected' : isNow ? 'now' : undefined}
                        className={clsx(
                            'border-0',
                            styles['styled-time-picker-root_cell'],
                            isNow && styles['styled-time-picker-root_cell__cell-now'],
                            isSelected && styles['styled-time-picker-root_cell__cell-selected'],
                        )}
                        onClick={() => {
                            const next = set(value ?? new Date(), isHours ? { hours: idx } : { minutes: idx })
                            onSelect(isHours ? clampToMinTime(next, minTime) : next)
                        }}
                    >
                        {idx.toString().padStart(2, '0')}
                    </button>
                )
            })}
        </div>
    )
}
