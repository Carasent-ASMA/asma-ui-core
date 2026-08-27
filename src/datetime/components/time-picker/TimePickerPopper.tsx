import { bindPopper, type PopupState } from 'src/hooks/usePopupState'
import { Fade, Paper, Popper } from 'src/components/mui-compat'
import type { StyledTimePickerProps } from './types'

import clsx from 'clsx'
import styles from './StyledTimePicker.module.scss'
import { TimePickerPanel } from './components/TimePickerPanel'

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
                        <TimePickerPanel
                            dataTest={dataTest}
                            value={value}
                            onSelect={onSelect}
                            handleClear={handleClear}
                            onConfirm={() => popupState.close()}
                        />
                    </Paper>
                </Fade>
            )}
        </Popper>
    )
}
