import { useState } from 'react'

import { StyledCalendarPicker } from './components/StyledCalendarPicker'
import type { DatePickerProps } from './types'
import { RangeInput } from './components/RangeInput'
import { DefaultInput } from './components/DefaultInput'
import { setPickerPosition } from './helpers'

export const StyledDatePicker = (props: DatePickerProps) => {
    const { compact } = props
    const [anchor, setAnchor] = useState<HTMLDivElement | null>(null)
    const [positionAbove, setPositionAbove] = useState(false)

    const openDatePicker = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchor(event.currentTarget)
        setPickerPosition(event, setPositionAbove)
    }

    const closeDatePicker = () => {
        setAnchor(null)
    }

    const isRangeCompact = compact && props.mode === 'range'

    return (
        <>
            {isRangeCompact ? (
                <RangeInput {...props} onClick={openDatePicker} />
            ) : (
                <DefaultInput {...props} onClick={openDatePicker} />
            )}

            <StyledCalendarPicker
                datePickerProps={{ ...props }}
                popoverProps={{ open: !!anchor, anchorEl: anchor, onClose: closeDatePicker }}
                positionAbove={positionAbove}
            />
        </>
    )
}
