import type { StyledTimePickerProps } from '../StyledTimePicker'
import styles from '../StyledTimePicker.module.scss'
import { TimePickerColumn } from './TimePickerColumn'

type TimePickerBodyProps = Omit<StyledTimePickerProps, 'placeholder' | 'disabled' | 'inputClassName'>

export const TimePickerBody: React.FC<TimePickerBodyProps & { dataTest?: string }> = ({ value, onSelect, dataTest }) => {
    return (
        <div data-test={dataTest} className={styles['root']}>
            <TimePickerColumn dataTest={`${dataTest}-hours`} type='hours' value={value} onSelect={onSelect} />
            <TimePickerColumn dataTest={`${dataTest}-minutes`} type='minutes' value={value} onSelect={onSelect} />
        </div>
    )
}
