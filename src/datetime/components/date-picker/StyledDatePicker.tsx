import { useState } from 'react'
import { StyledCalendarPicker } from './components/StyledCalendarPicker'
import type { DatePickerProps } from './types'
import { setPickerPosition } from './helpers'
import { DatePickerInputIndex } from './components/DatePickerInputIndex'
import { useIsMobileView } from 'src/datetime/hooks/useWindowWidthSize.hook'
import { StyledDrawer as Drawer } from 'src/components/navigation/drawer'
import { StyledDayPicker } from './components/StyledDayPicker'
import { useBackNavigationClose } from 'src/datetime/hooks/useBackNavigationClose.hook'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#14333-90631
 * Figma "Date picker". The trigger is the outlined **Input field** (`field-styles`) + a `delta-500`
 * outlined calendar **Button** (disabled with the field). The calendar is the **Date picker month**
 * (360×392) in a `StyledPopover` (desktop) or a bottom-sheet `Drawer` (mobile, with safe-area `pb`).
 * **Day** cells are 40×40, number Body Base SemiBold 16/lh24, per state (node 14333-90932):
 * default text delta-800 / hover delta-50 / radius 4; **today** gama-50 + 2px gama-400 border (hover
 * gama-100); **selected** gama-500 fill + white text + white inset ring, radius 8 (hover gama-600);
 * **other-month** delta-600 Regular; **range** gama-50 fill (hover gama-100); **disabled** delta-300;
 * week number delta-700 14px; weekday header delta-600. Non-annotated props are behavioral.
 */
export const StyledDatePicker = (props: DatePickerProps): JSX.Element => {
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
                <Drawer anchor={'bottom'} open={!!anchorEl} onClose={onClose} anchorEl={anchorEl}>
                    {/* Bottom-sheet needs breathing room below the footer (+ device safe-area/home
                        indicator) — otherwise the calendar footer hugs the screen edge. */}
                    <div className='mx-auto max-w-[360px] px-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]'>
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
