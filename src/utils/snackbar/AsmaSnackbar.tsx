/* eslint-disable no-param-reassign */
import CloseIcon from '@mui/icons-material/Close'
import { type SnackbarCloseReason } from '@mui/material'

import IconButton from '@mui/material/IconButton'
import { produce } from 'immer'
import type { SyntheticEvent } from 'react'
import { useRecoilState } from 'recoil'

import { snackbarStateAtom } from './resources/useSnackbar'
import { StyledSnackbar } from '../../components/feedback/StyledSnackbar'
import { StyledAlert } from '../../components/feedback/StyledAlert'
import { StyledButton } from '../../components/inputs'

function AsmaSnackbar() {
    const [{ alertMessage, anchorOrigin, open, severity, action, autoHideDuration }, setAlertAtom] =
        useRecoilState(snackbarStateAtom)

    const onClose = (_: Event | SyntheticEvent<any, Event>, reason: SnackbarCloseReason): void => {
        if (reason === 'clickaway') {
            return
        }
        close()
    }

    const close = () => {
        setAlertAtom(
            produce((draftState) => {
                draftState.open = false
            }),
        )
    }

    const handleExited = () => {
        setAlertAtom(
            produce((draftState) => {
                draftState.alertMessage = ''
            }),
        )
    }

    return (
        <StyledSnackbar
            anchorOrigin={{
                vertical: anchorOrigin?.vertical,
                horizontal: anchorOrigin?.horizontal,
            }}
            open={open}
            onClose={onClose}
            autoHideDuration={autoHideDuration || 10000}
            TransitionProps={{ onExited: handleExited }}
        >
            <div>
                <StyledAlert severity={severity} variant='filled'>
                    {alertMessage}
                    {action && (
                        <StyledButton
                            size='small'
                            variant='text'
                            onClick={() => {
                                action.snackbarAction()
                                close()
                            }}
                        >
                            {action.buttonText}
                        </StyledButton>
                    )}
                    <IconButton
                        color='inherit'
                        aria-label='close'
                        title='close'
                        onClick={close}
                        sx={{
                            marginLeft: '8px',
                        }}
                    >
                        <CloseIcon sx={{ fontSize: '18px' }} />
                    </IconButton>
                </StyledAlert>
            </div>
        </StyledSnackbar>
    )
}

export default AsmaSnackbar
