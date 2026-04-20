import type { AlertColor } from '@mui/material'
import { ContentCopyIcon } from 'asma-ui-icons'
import type { SnackbarProviderProps } from 'notistack'
import { type FC, type PropsWithChildren, type ReactNode } from 'react'
import { StyledTooltip } from 'src/components/data-display/tooltip'
import { StyledButton } from 'src/components/inputs/button'
import { cn } from 'src/helpers/cn'

import style from './CopyWrapper.module.scss'

export type MessageProps = SnackbarProviderProps & {
    severity?: AlertColor
    persist?: boolean
    closeButton?: boolean
    className?: string
    id?: string
    type?: 'loading'
}

export const CopyWrapper: FC<
    PropsWithChildren<{
        className?: string
        contentToCopy: string
        locale: 'en' | 'no'
        messageInfo: (info: ReactNode, options?: MessageProps) => () => void
    }>
> = ({ className, contentToCopy, locale, messageInfo, children }) => {
    return (
        <div className={cn('flex items-center hover:text-gama-500', style['copy-wrapper'], className)}>
            {children}
            <StyledTooltip title={locale === 'no' ? 'Kopier' : 'Copy'} className={style['hidden-copy']}>
                <div>
                    <StyledButton
                        dataTest='copy-button'
                        size='small'
                        variant='text'
                        className='cursor-pointer'
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            navigator.clipboard
                                .writeText(contentToCopy)
                                .then(() => {
                                    messageInfo(locale === 'no' ? 'Kopiert til utklippstavle' : 'Copied to clipboard')
                                })
                                .catch((e) => console.error('Copying failed with this: ', e))
                        }}
                        startIcon={<ContentCopyIcon width={20} height={20} />}
                    />
                </div>
            </StyledTooltip>
        </div>
    )
}
