import { useState } from 'react'

import { StyledCalendarPicker } from './components/StyledCalendarPicker'
import type { DatePickerProps } from './types'
import { setPickerPosition } from './helpers'
import { DatePickerInputIndex } from './components/DatePickerInputIndex'
//import './components/index.scss'

export const StyledDatePicker = (props: DatePickerProps) => {
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)
    const [positionAbove, setPositionAbove] = useState(false)

    const openDatePicker = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget)
        setPickerPosition(event, setPositionAbove)
    }

    const onClose = () => {
        setAnchorEl(null)
    }

    return (
        <>
            <DatePickerInputIndex {...props} onClick={openDatePicker} />
            <StyledCalendarPicker
                datePickerProps={{ ...props }}
                popoverProps={{ open: !!anchorEl, anchorEl, onClose }}
                positionAbove={positionAbove}
            />
        </>
    )
}
