import type { DatePickerProps } from '../types'
import { DatePickerInputRangeCompact } from './DatePickerInputRangeCompact'
import { DatePickerInputSingle } from './DatePickerInputSingle'

export const DatePickerInputIndex: React.FC<{
    datePickerProps: DatePickerProps
    onClick: (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void
}> = ({ datePickerProps, onClick }) => {
    const isRange = datePickerProps.mode === 'range'

    return isRange ? (
        <DatePickerInputRangeCompact datePickerProps={datePickerProps} onClick={onClick} />
    ) : (
        <DatePickerInputSingle datePickerProps={datePickerProps} onClick={onClick} />
    )
}
