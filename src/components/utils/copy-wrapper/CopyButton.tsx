import { ContentCopyIcon } from 'asma-ui-icons'
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
                    className={className}
                    size='small'
                    variant='text'
                    startIcon={<ContentCopyIcon width={20} height={20} />}
                    onClick={() => {
                        navigator.clipboard
                            .writeText(contentToCopy)
                            .then(() => {
                                messageInfo(locale === 'no' ? 'Kopiert til utklippstavle' : 'Copied to clipboard')
                            })
                            .catch((e) => console.error('Copying failed with this: ', e))
                    }}
                >
                    {!isMobile && (text ?? title)}
                </StyledButton>
            </div>
        </StyledTooltip>
    )
}
