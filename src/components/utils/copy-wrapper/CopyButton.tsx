import { ContentCopyIcon } from 'asma-ui-icons'
import { type FC, type ReactNode } from 'react'
import { StyledButton, StyledTooltip, type MessageProps } from 'src'
import { useIsMobileView } from 'src/hooks/useWindowWidthSize.hook'

export const CopyButton: FC<{
    className?: string
    contentToCopy: string
    locale: 'en' | 'no'
    messageInfo: (info: ReactNode, options?: MessageProps) => () => void
    text?: string
}> = ({ className, contentToCopy, locale, messageInfo, text }) => {
    const title = locale === 'en' ? 'Copy' : 'Kopier'
    const isMobile = useIsMobileView()

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
                        navigator.clipboard.writeText(contentToCopy).then(() => {
                            messageInfo(locale === 'no' ? 'Kopiert til utklippstavle' : 'Copied to clipboard')
                        })
                    }}
                >
                    {!isMobile && (text ?? title)}
                </StyledButton>
            </div>
        </StyledTooltip>
    )
}
