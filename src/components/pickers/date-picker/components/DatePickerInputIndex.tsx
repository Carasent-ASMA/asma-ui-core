import type { DatePickerProps } from '../types'
import { DatePickerInputRange } from './DatePickerInputRange'
import { DatePickerInputRangeCompact } from './DatePickerInputRangeCompact'
import { DatePickerInputSingle } from './DatePickerInputSingle'

/**
 *
 * @remarks  error and helper text will work only for Single
 *
 * Custom props:
 * @param error - boolean
 * @param helperText - ReactNode
 */
export const DatePickerInputIndex: React.FC<
    DatePickerProps & { onClick: (e: React.MouseEvent<HTMLDivElement>) => void }
> = (props) => {
    const isRange = props.mode === 'range' && !props.compact
    const isRangeCompact = props.mode === 'range' && props.compact

    if (isRange) return <DatePickerInputRange {...props} onClick={props.onClick} />
    if (isRangeCompact) return <DatePickerInputRangeCompact {...props} onClick={props.onClick} />

    // isSingle
    return <DatePickerInputSingle {...props} onClick={props.onClick} />
}

// {
//     isRangeCompact ? (
//         <RangeCompactInput {...props} onClick={openDatePicker} />
//     ) : (
//         <SingleInput {...props} onClick={openDatePicker} />
//     )
// }
