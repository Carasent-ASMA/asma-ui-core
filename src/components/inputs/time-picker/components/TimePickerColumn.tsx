import { getHours, getMinutes, set } from 'date-fns'
import type { StyledTimePickerProps } from '../StyledTimePicker'
import styles from '../StyledTimePicker.module.scss'
import clsx from 'clsx'
export type TimePickerColumnProps = Omit<StyledTimePickerProps, 'placeholder' | 'disabled' | 'inputClassName'> & {
    type: 'hours' | 'minutes'
}

export const TimePickerColumn: React.FC<TimePickerColumnProps & { dataTest?: string }> = ({ type, value, onSelect, dataTest }) => {
    const now = new Date()
    const isHours = type === 'hours'
    const size = isHours ? 24 : 60
    const currentTime = isHours ? now.getHours() : now.getMinutes()

    return (
        <div className={styles['columns']} data-test={dataTest} >
            {new Array(size).fill(null).map((_, idx) => {
                const isSelected = value && idx === (isHours ? getHours(value) : getMinutes(value))
                const isNow = currentTime == idx
                const className = isSelected ? styles['cell-selected'] : isNow ? styles['cell-now'] : ''

                return (
                    <div
                        key={idx}
                        className={clsx(className, styles['cell'])}
                        onClick={() => {
                            value && onSelect(set(value, isHours ? { hours: idx } : { minutes: idx }))
                        }}
                    >
                        {idx.toString().padStart(2, '0')}
                    </div>
                )
            })}
        </div>
    )
}
