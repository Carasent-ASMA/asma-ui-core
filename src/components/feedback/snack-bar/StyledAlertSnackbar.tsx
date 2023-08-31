import type { AlertColor } from '@mui/material'
import { SnackbarContent, type CustomContentProps, useSnackbar } from 'notistack'
import { forwardRef } from 'react'
import { StyledAlert } from '../alert'

interface StyledAlertSnackbarProps extends CustomContentProps {
    severity?: AlertColor
    alertVariant?: 'standard' | 'filled' | 'outlined'
    closeButton?: boolean
}

export const StyledAlertSnackbar = forwardRef<HTMLDivElement, StyledAlertSnackbarProps>((props, ref) => {
    const { id, message, severity, alertVariant, closeButton, ...other } = props

    const { closeSnackbar } = useSnackbar()

    const handleClose = () => closeSnackbar(id)

    return (
        <SnackbarContent ref={ref} role='alert' {...other}>
            <StyledAlert severity={severity} variant={alertVariant} onClose={closeButton ? handleClose : undefined}>
                {message}
            </StyledAlert>
        </SnackbarContent>
    )
})
