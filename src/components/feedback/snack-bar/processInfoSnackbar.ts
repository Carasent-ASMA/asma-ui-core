import { enqueueSnackbar } from 'notistack'

export function processInfoSnackbar(message: string) {
    enqueueSnackbar({
        variant: 'alert',
        message,
        severity: 'success',
        alertClassName:
            'min-w-[350px] bg-theta-700 flex w-full text-center justify-center items-center !text-[color:var(--colors-link-text-standart)]',
        alertVariant: 'filled',
        autoHideDuration: 6000,
        closeButton: true,
        anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
        },
    })
}
