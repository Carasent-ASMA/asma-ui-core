import { getHours, getMinutes, set } from 'date-fns'
import clsx from 'clsx'
import type { StyledTimePickerProps } from '../types'
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
        <div
            className={
                'styled-time-picker-root_column overflow-y-scroll scrollbar-track-transparent scrollbar-thumb-delta-100 scrollbar-thin'
            }
        >
            {new Array(size).fill(null).map((_, _index) => {
                //  _index * 5 for minutes column
                const idx = isHours ? _index : _index * 5
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
