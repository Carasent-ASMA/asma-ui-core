import type { StyledTimePickerProps } from '../StyledTimePicker'
import { TimePickerColumn } from './TimePickerColumn'

type TimePickerBodyProps = Omit<StyledTimePickerProps, 'placeholder' | 'disabled' | 'inputClassName'>

export const TimePickerBody: React.FC<Omit<TimePickerBodyProps, 'anchorOrigin' | 'anchorPosition'>> = ({
    value,
    onSelect,
    dataTest,
}) => {
    return (
        <div data-test={dataTest} className={'styled-time-picker-root'}>
            <TimePickerColumn type='hours' value={value} onSelect={onSelect} />
            <TimePickerColumn type='minutes' value={value} onSelect={onSelect} />
        </div>
    )
}
