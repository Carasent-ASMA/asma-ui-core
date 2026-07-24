import type { DatePickerProps } from '../types'
import { StyledPopover as Popover, type StyledPopoverProps as PopoverProps } from 'src/components/utils/popover'
import { StyledDayPicker } from './StyledDayPicker'

export const StyledCalendarPicker: React.FC<{
    datePickerProps: DatePickerProps
    popoverProps: PopoverProps
    positionAbove: boolean
}> = ({ datePickerProps, popoverProps, positionAbove }) => {
    const { open, anchorEl, onClose } = popoverProps

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: positionAbove ? 'top' : 50,
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: positionAbove ? 'bottom' : 'top',
                horizontal: 'left',
            }}
        >
            <div className='p-4'>
                <StyledDayPicker datePickerProps={datePickerProps} popoverProps={popoverProps} />
            </div>
        </Popover>
    )
}
