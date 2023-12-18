import { enqueueSnackbar } from 'notistack'

export function processAlertSnackBar(message: string) {
    enqueueSnackbar({
        message,
        variant: 'alert',
        severity: 'error',
        alertClassName: 'min-w-[350px] max-w-[350px]',
        alertVariant: 'filled',
        closeButton: true,
        autoHideDuration: 6000,
        anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
        },
    })
}
