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
        <Popper {...bindPopper(popupState)} transition className='z-[1300] absolute top-2'>
            {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}>
                    <Paper className='pb-[1px]'>
                        <TimePickerBody dataTest={`${dataTest}-time-picker-body`} value={value} onSelect={onSelect} />
                        <div className='flex my-3 justify-between'>
                            <StyledButton
                                variant='text'
                                onClick={handleClear}
                                size='small'
                                disabled={!value}
                                dataTest='select-today'
                                className='!min-w-[40px] ml-2.5'
                                startIcon={<Icon icon='ph:eraser-duotone' width={24} height={24} />}
                            />
                            <StyledButton
                                size='small'
                                onClick={() => popupState.close()}
                                dataTest='select-time'
                                className='!min-w-[40px] mr-4'
                                startIcon={<Icon icon='bi:check-lg' width={20} height={20} />}
                            ></StyledButton>
                        </div>
                    </Paper>
                </Fade>
            )}
        </Popper>
    )
}
