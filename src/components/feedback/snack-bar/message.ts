import type { ReactNode } from 'react'

import { processMessageError } from './components/processMessageError'
import { processMessageInfo } from './components/processMessageInfo'
import type { MessageProps } from './components/types'

export const message = {
    info: (messageInfo: string | ReactNode, options?: MessageProps): (() => void) =>
        processMessageInfo(messageInfo, options),
    error: (messageInfo: string | ReactNode, options?: MessageProps): (() => void) =>
        processMessageError(messageInfo, options),
    loading: (messageInfo: string | ReactNode, options?: MessageProps): (() => void) =>
        processMessageInfo(messageInfo, { ...options, type: 'loading' }),
}

export type { MessageProps }
