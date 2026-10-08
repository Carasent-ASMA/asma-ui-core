import type { SnackbarKey, SnackbarMessage } from 'notistack'
import { closeSnackbar, enqueueSnackbar } from './snackbarHost'
import type { StyledDefaultSnackbarProps } from './components/StyledDefaultSnackbar'

export function processDefaultSnackbar(message: SnackbarMessage, options: Partial<StyledDefaultSnackbarProps> = {}): { onClose: () => void; snackbarKey: SnackbarKey; } {
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