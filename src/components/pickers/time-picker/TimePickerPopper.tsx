import { bindPopper, type PopupState } from 'material-ui-popup-state/hooks'
import { TimePickerBody } from './components/TimePickerBody'
import { StyledButton } from 'src/components/inputs/button'
import { Fade, Paper, Popper } from '@mui/material'
import { Icon } from '@iconify/react'
import type { StyledTimePickerProps } from './types'

export const TimePickerPopper: React.FC<StyledTimePickerProps & { popupState: PopupState; handleClear: () => void }> = (
    props,
) => {
    const { popupState, dataTest, value, onSelect, handleClear } = props

    return (
        <Popper {...bindPopper(popupState)} transition style={{ zIndex: '1300', position: 'absolute', top: '2px' }}>
            {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}>
                    <Paper style={{ paddingBottom: '1px' }}>
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
                                variant='text'
                                onClick={handleClear}
                                size='small'
                                disabled={!value}
                                dataTest='select-today'
                                style={{ minWidth: '40px', marginLeft: '10px' }}
                                startIcon={<Icon icon='ph:eraser-duotone' width={24} height={24} />}
                            />
                            <StyledButton
                                size='small'
                                onClick={() => popupState.close()}
                                dataTest='select-time'
                                style={{ minWidth: '40px', marginRight: '16px' }}
                                startIcon={<Icon icon='bi:check-lg' width={20} height={20} />}
                            />
                        </div>
                    </Paper>
                </Fade>
            )}
        </Popper>
    )
}
