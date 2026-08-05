import { ContentCopyIcon } from 'src/components/icons'
import { type FC, type ReactNode } from 'react'
import { StyledButton, StyledTooltip, type MessageProps } from 'src'
import { useMobileMediaQuery } from 'src/hooks/useMediaQuery.hook'

export const CopyButton: FC<{
    className?: string
    contentToCopy: string
    locale: 'en' | 'no'
    messageInfo: (info: ReactNode, options?: MessageProps) => () => void
    text?: string
}> = ({ className, contentToCopy, locale, messageInfo, text }) => {
    const title = locale === 'en' ? 'Copy' : 'Kopier'
    const isMobile = useMobileMediaQuery()

    return (
        <StyledTooltip title={title}>
            <div>
                <StyledButton
                    dataTest='copy-button'
                    aria-label={text ?? title}
                    className={className}
                    size='small'
                    variant='text'
                    startIcon={<ContentCopyIcon width={20} height={20} />}
                    onMouseDown={(e) => {
                        e.stopPropagation()
                    }}
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        navigator.clipboard
                            .writeText(contentToCopy)
                            .then(() => {
                                messageInfo(locale === 'no' ? 'Kopiert til utklippstavle' : 'Copied to clipboard')
                            })
                            .catch((err) => console.error('Copying failed with this: ', err))
                    }}
                >
                    {!isMobile && (text ?? title)}
                </StyledButton>
            </div>
        </StyledTooltip>
    )
}
