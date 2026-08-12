import { bindPopper, type PopupState } from 'src/hooks/usePopupState'
import { TimePickerBody } from './components/TimePickerBody'
import { Fade, Paper, Popper } from 'src/components/mui-compat'
import type { StyledTimePickerProps } from './types'

import { EraserIcon } from 'src/datetime/shared-components/EraserIcon'
import { CheckIcon } from 'src/datetime/shared-components/CheckIcon'
import clsx from 'clsx'
import styles from './StyledTimePicker.module.scss'
import { StyledButton } from 'src/datetime/shared-components/button'

export const TimePickerPopper: React.FC<StyledTimePickerProps & { popupState: PopupState; handleClear: () => void }> = (
    props,
) => {
    const { popupState, dataTest, value, onSelect, handleClear } = props

    return (
        <Popper
            {...bindPopper(popupState)}
            transition
            // No `position` here: `Popper` picks the strategy itself (`fixed` when it has to join the
            // top layer above a modal dialog), and an override would place the popper off-anchor.
            style={{ zIndex: '1300' }}
        >
            {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}>
                    {/* DS Menus dropdown surface (delta-300 border + Menus shadow), not the heavy MUI elevation. */}
                    <Paper elevation={0} className={clsx(styles['time-picker-surface'])} style={{ paddingBottom: '1px' }}>
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
                                onClick={() => popupState.close()}
                                style={{ minWidth: '40px', marginRight: '16px' }}
                            >
                                <CheckIcon width={20} height={20} />
                            </StyledButton>
                        </div>
                    </Paper>
                </Fade>
            )}
        </Popper>
    )
}
