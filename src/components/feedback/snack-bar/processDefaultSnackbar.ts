import { closeSnackbar, enqueueSnackbar, type SnackbarMessage } from 'notistack'
import type { StyledDefaultSnackbarProps } from './components/StyledDefaultSnackbar'

export function processDefaultSnackbar(message: SnackbarMessage, options: Partial<StyledDefaultSnackbarProps> = {}) {
    const { severity = 'info', ...rest } = options

    const snackbarKey = enqueueSnackbar(message, {
        variant: 'default',
        anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
        },
        severity,
        ...rest,
    })

    return {
        onClose: () => closeSnackbar(snackbarKey),
        snackbarKey,
    }
}