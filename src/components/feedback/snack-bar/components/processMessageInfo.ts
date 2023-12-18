import { closeSnackbar, enqueueSnackbar } from 'notistack'
import type { ReactNode } from 'react'
import type { MessageProps } from './types'

export function processMessageInfo(messageInfo: string | ReactNode, options?: MessageProps): () => void {
    enqueueSnackbar({
        variant: 'info',
        message: messageInfo,
        autoHideDuration: 6000,
        className: 'bg-gama-700 text-white !min-w-[100px] !max-w-[400px] rounded-md p-4 flex items-center',
        anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
        },
        ...options,
    })

    return () => {
        return closeSnackbar(options?.id)
    }
}
