import { useEffect, useRef } from 'react'
import { TimePickerColumn } from './TimePickerColumn'
import type { StyledTimePickerProps } from '../types'
import styles from '../StyledTimePicker.module.scss'
type TimePickerBodyProps = Omit<StyledTimePickerProps, 'placeholder' | 'disabled' | 'inputClassName'>

export const TimePickerBody: React.FC<Omit<TimePickerBodyProps, 'anchorOrigin'>> = ({ value, onSelect, dataTest }) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Center the selected (fallback: current) time in each column. Queries `data-cell` because
        // CSS-module class names are hashed (the previous literal-class selector never matched).
        // Scrolls the column via scrollTop instead of scrollIntoView so opening the picker can
        // never scroll the page or the drawer around it.
        const root = ref.current
        if (!root) return
        const selected = root.querySelectorAll<HTMLElement>('[data-cell="selected"]')
        const targets = selected.length ? selected : root.querySelectorAll<HTMLElement>('[data-cell="now"]')
        targets.forEach((cell) => {
            const column = cell.parentElement
            if (!column) return
            column.scrollTop = cell.offsetTop - column.offsetTop - (column.clientHeight - cell.clientHeight) / 2
        })
    }, [ref])

    return (
        <div ref={ref} data-test={dataTest} className={styles['styled-time-picker-root']}>
            <TimePickerColumn type='hours' value={value} onSelect={onSelect} />
            <TimePickerColumn type='minutes' value={value} onSelect={onSelect} />
        </div>
    )
}
