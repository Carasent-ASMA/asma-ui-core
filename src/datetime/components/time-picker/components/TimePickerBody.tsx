import { useEffect, useRef } from 'react'
import { TimePickerColumn } from './TimePickerColumn'
import type { StyledTimePickerProps } from '../types'
import styles from '../StyledTimePicker.module.scss'
type TimePickerBodyProps = Omit<StyledTimePickerProps, 'placeholder' | 'disabled' | 'inputClassName'>

export const TimePickerBody: React.FC<Omit<TimePickerBodyProps, 'anchorOrigin'>> = ({ value, onSelect, dataTest }) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const isSelected = ref.current?.querySelectorAll('div.styled-time-picker-root_cell__cell-selected').length
        ref.current
            ?.querySelectorAll(
                isSelected
                    ? 'div.styled-time-picker-root_cell__cell-selected'
                    : 'div.styled-time-picker-root_cell__cell-now',
            )
            .forEach((e) => e.scrollIntoView())
    }, [ref])

    return (
        <div ref={ref} data-test={dataTest} className={styles['styled-time-picker-root']}>
            <TimePickerColumn type='hours' value={value} onSelect={onSelect} />
            <TimePickerColumn type='minutes' value={value} onSelect={onSelect} />
        </div>
    )
}
