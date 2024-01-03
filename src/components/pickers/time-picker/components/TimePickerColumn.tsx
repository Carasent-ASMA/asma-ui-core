import { getHours, getMinutes, set } from 'date-fns'
import type { StyledTimePickerProps } from '../StyledTimePicker'
import clsx from 'clsx'
export type TimePickerColumnProps = Omit<
    StyledTimePickerProps,
    'placeholder' | 'disabled' | 'inputClassName' | 'dataTest'
> & {
    type: 'hours' | 'minutes'
}

export const TimePickerColumn: React.FC<TimePickerColumnProps> = ({ type, value, onSelect }) => {
    const now = new Date()
    const isHours = type === 'hours'
    const size = isHours ? 24 : 60
    const currentTime = isHours ? now.getHours() : now.getMinutes()

    return (
        <div className={'styled-time-picker-root_column'}>
            {new Array(size).fill(null).map((_, idx) => {
                const isSelected = value && idx === (isHours ? getHours(value) : getMinutes(value))
                const isNow = currentTime == idx

                return (
                    <div
                        key={idx}
                        className={clsx(
                            'styled-time-picker-root_cell',
                            isSelected && 'styled-time-picker-root_cell__cell-selected',
                            isNow && 'styled-time-picker-root_cell__cell-now',
                        )}
                        onClick={() => {
                            onSelect(set(value || new Date(), isHours ? { hours: idx } : { minutes: idx }))
                        }}
                    >
                        {idx.toString().padStart(2, '0')}
                    </div>
                )
            })}
        </div>
    )
}
