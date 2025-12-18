import { ContentCopyIcon } from 'asma-ui-icons'
import { type FC, type PropsWithChildren, type ReactNode } from 'react'
import { StyledTooltip } from 'src/components/data-display/tooltip'
import type { MessageProps } from 'src/components/feedback/snack-bar/components/types'
import { StyledButton } from 'src/components/inputs/button'
import { cn } from 'src/helpers/cn'

import style from './CopyWrapper.module.scss'

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
                                    messageInfo(locale === 'no' ? 'Kopieres til utklippstavlen' : 'Copied to clipboard')
                                })
                                .catch((e: unknown) => {
                                    console.error('Failed to copy to clipboard with: ', e)
                                })
                        }}
                        startIcon={<ContentCopyIcon width={20} height={20} />}
                    />
                </div>
            </StyledTooltip>
        </div>
    )
}
