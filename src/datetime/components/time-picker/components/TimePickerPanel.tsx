import { TimePickerBody } from './TimePickerBody'
import { EraserIcon } from 'src/datetime/shared-components/EraserIcon'
import { CheckIcon } from 'src/datetime/shared-components/CheckIcon'
import { StyledButton } from 'src/datetime/shared-components/button'
import type { TimePredicate } from '../helpers/disabledTime'
import type { ReactNode } from 'react'

export interface TimePickerPanelProps {
    dataTest: string
    value?: Date
    minTime?: Date
    isTimeDisabled?: TimePredicate
    disabledTimeReason?: ReactNode
    onSelect: (date: Date | undefined) => void
    handleClear: () => void
    onConfirm: () => void
}

/**
 * Hour/minute columns + eraser/confirm footer — the inner picker surface shared by the desktop
 * popper (`TimePickerPopper`) and the mobile bottom-sheet drawer (`StyledTimePicker`).
 */
export const TimePickerPanel: React.FC<TimePickerPanelProps> = ({
    dataTest,
    value,
    minTime,
    isTimeDisabled,
    disabledTimeReason,
    onSelect,
    handleClear,
    onConfirm,
}) => (
    <>
        <TimePickerBody
            dataTest={`${dataTest}-time-picker-body`}
            value={value}
            minTime={minTime}
            isTimeDisabled={isTimeDisabled}
            disabledTimeReason={disabledTimeReason}
            onSelect={onSelect}
        />
        <div
            style={{
                display: 'flex',
                marginTop: '12px',
                marginBottom: '12px',
                justifyContent: 'space-between',
            }}
        >
            {/* Icon-only buttons: the glyph contributes no text, so both need an explicit
                accessible name (axe `button-name`, ASMA-8143). */}
            <StyledButton
                dataTest='time-picker-erase-button'
                data-testid='time-picker-erase-button'
                aria-label='Clear time'
                variant='text'
                onClick={handleClear}
                size='small'
                disabled={!value}
                style={{ minWidth: '40px', marginLeft: '10px' }}
            >
                <EraserIcon width={24} height={24} />
            </StyledButton>
            <StyledButton
                dataTest='time-picker-confirm-button'
                data-testid='time-picker-confirm-button'
                aria-label='Confirm time'
                variant='contained'
                size='small'
                onClick={onConfirm}
                style={{ minWidth: '40px', marginRight: '16px' }}
            >
                <CheckIcon width={20} height={20} />
            </StyledButton>
        </div>
    </>
)
