import { useState } from 'react'
import { StyledCalendarPicker } from './components/StyledCalendarPicker'
import type { DatePickerProps } from './types'
import { setPickerPosition } from './helpers'
import { DatePickerInputIndex } from './components/DatePickerInputIndex'
import { useIsMobileView } from 'src/datetime/hooks/useWindowWidthSize.hook'
import { Drawer } from '@mui/material'
import { StyledDayPicker } from './components/StyledDayPicker'
import { useBackNavigationClose } from 'src/datetime/hooks/useBackNavigationClose.hook'

export const StyledDatePicker = (props: DatePickerProps) => {
    const isMobile = useIsMobileView()
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | HTMLDivElement | null>(null)
    const [positionAbove, setPositionAbove] = useState(false)
    const [validateOnCalendarClose, setValidateOnCalendarClose] = useState(false)

    const openDatePicker = (event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
        setAnchorEl(event.currentTarget)
        setPickerPosition(event, setPositionAbove)
    }

    const onClose = () => {
        setValidateOnCalendarClose(true)
        setAnchorEl(null)
    }

    useBackNavigationClose({ open: !!anchorEl, onClose })
    const sharedProps: DatePickerProps = {
        ...props,
        validateOnCalendarClose,
        onValidatedOnce: () => setValidateOnCalendarClose(false),
    }
    return (
        <>
            <DatePickerInputIndex datePickerProps={sharedProps} onClick={openDatePicker} />
            {!isMobile && (
                <StyledCalendarPicker
                    datePickerProps={{ ...sharedProps }}
                    popoverProps={{ open: !!anchorEl, anchorEl, onClose }}
                    positionAbove={positionAbove}
                />
            )}
            {isMobile && (
                <Drawer
                    anchor={'bottom'}
                    open={!!anchorEl}
                    onClose={onClose}
                    sx={{ zIndex: 1300 }}
                    className='z-[1300]'
                >
                    <div className='max-w-[360px] mx-auto'>
                        <StyledDayPicker
                            datePickerProps={{ ...sharedProps }}
                            popoverProps={{ open: !!anchorEl, anchorEl, onClose }}
                        />
                    </div>
                </Drawer>
            )}
        </>
    )
}
