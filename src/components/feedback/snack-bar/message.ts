import type { ReactNode } from 'react'
import { processMessageInfo } from './components/processMessageInfo'
import { processMessageError } from './components/processMessageError'
import type { MessageProps } from './components/types'

/**
 * Important props:
 * @param id - string. To control the message
 * @remarks use callBack function to close the message manually. Providing ID as a param is important in this case.
 * Without ID, callback fil force close all active notifications
 * @param closeButton -  true | false
 * @param persist -  true | false
 * @param autoHideDuration -  number
 * @moreProps https://notistack.com/api-reference#mutual-props
 */
export const message = {
    info: (messageInfo: string | ReactNode, options?: MessageProps): (() => void) =>
        processMessageInfo(messageInfo, options),
    error: (messageInfo: string | ReactNode, options?: MessageProps): (() => void) =>
        processMessageError(messageInfo, options),
    loading: (messageInfo: string | ReactNode, options?: MessageProps): (() => void) =>
        processMessageInfo(messageInfo, { ...options, type: 'loading' }),
}
