import { ContentCopyIcon } from 'asma-ui-icons'
import { type FC } from 'react'
import { StyledButton, StyledTooltip, defaultSnackProps } from 'src'
import { message } from 'src/components/feedback/snack-bar'
import type { MessageProps } from 'src/components/feedback/snack-bar/components/types'
import { useIsMobileView } from 'src/hooks/useWindowWidthSize.hook'

export const CopyButton: FC<{
    className?: string
    contentToCopy: string
    locale: 'en' | 'no'
    snackProps?: MessageProps
    text?: string
}> = ({ className, contentToCopy, locale, snackProps, text }) => {
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
                            message.info(locale === 'no' ? 'Kopieres til utklippstavlen' : 'Copied to clipboard', {
                                ...defaultSnackProps,
                                ...snackProps,
                            })
                        })
                    }}
                >
                    {!isMobile && (text || title)}
                </StyledButton>
            </div>
        </StyledTooltip>
    )
}
