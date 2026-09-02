import { closeSnackbar, enqueueSnackbar } from 'notistack'
import type { ReactNode } from 'react'

import type { MessageProps } from './types'

export function processMessageInfo(messageInfo: string | ReactNode, options?: MessageProps): () => void {
    enqueueSnackbar({
        variant: 'info',
        message: messageInfo,
        autoHideDuration: 6000,
        className: 'flex h-10 items-center gap-1 rounded-lg bg-gama-700 pl-2 pr-1 text-sm text-white !min-w-[100px] !max-w-[400px]',
        anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
        },
        ...options,
    })

    return () => closeSnackbar(options?.id)
}
