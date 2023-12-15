import { closeSnackbar, enqueueSnackbar } from 'notistack'
import type { ReactNode } from 'react'
import type { MessageProps } from './types'

export function processMessageError(messageInfo: string | ReactNode, options?: MessageProps): () => void {
    enqueueSnackbar({
        variant: 'info',
        message: messageInfo,
        autoHideDuration: 10000,
        className: 'bg-red-600 text-red-200 !min-w-[100px] rounded-md p-4 flex items-center',
        anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
        },
        ...options,
    })

    return () => {
        return closeSnackbar(options?.id)
    }
}
