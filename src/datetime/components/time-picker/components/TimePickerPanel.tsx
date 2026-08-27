import { TimePickerBody } from './TimePickerBody'
import { EraserIcon } from 'src/datetime/shared-components/EraserIcon'
import { CheckIcon } from 'src/datetime/shared-components/CheckIcon'
import { StyledButton } from 'src/datetime/shared-components/button'

export interface TimePickerPanelProps {
    dataTest: string
    value?: Date
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
    onSelect,
    handleClear,
    onConfirm,
}) => (
    <>
        <TimePickerBody dataTest={`${dataTest}-time-picker-body`} value={value} onSelect={onSelect} />
        <div
            style={{
                display: 'flex',
                marginTop: '12px',
                marginBottom: '12px',
                justifyContent: 'space-between',
            }}
        >
            <StyledButton
                dataTest='time-picker-erase-button'
                data-testid='time-picker-erase-button'
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
