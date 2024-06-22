import { useEffect, useRef } from 'react'
import { TimePickerColumn } from './TimePickerColumn'
import type { StyledTimePickerProps } from '../types'
import style from '../StyledTimePicker.module.scss'

type TimePickerBodyProps = Omit<StyledTimePickerProps, 'placeholder' | 'disabled' | 'inputClassName'>

const divTimePickerRootCellSelected = style['styled-time-picker-root_cell__cell-selected']
export const TimePickerBody: React.FC<Omit<TimePickerBodyProps, 'anchorOrigin'>> = ({ value, onSelect, dataTest }) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        ref.current?.querySelectorAll(`div.${divTimePickerRootCellSelected}`).forEach((e) => e.scrollIntoView())
    }, [ref])

    return (
        <div ref={ref} data-test={dataTest} className={style['styled-time-picker-root']}>
            <TimePickerColumn type='hours' value={value} onSelect={onSelect} />
            <TimePickerColumn type='minutes' value={value} onSelect={onSelect} />
        </div>
    )
}
