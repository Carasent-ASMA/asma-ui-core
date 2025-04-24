import { ContentCopyIcon } from 'asma-ui-icons'
import { type FC, type PropsWithChildren } from 'react'
import { StyledTooltip } from 'src/components/data-display/tooltip'
import { message } from 'src/components/feedback/snack-bar'
import { StyledInfoSnackbar } from 'src/components/feedback/snack-bar/components/StyledInfoSnackbar'
import type { MessageProps } from 'src/components/feedback/snack-bar/components/types'
import { StyledButton } from 'src/components/inputs/button'
import { cn } from 'src/helpers/cn'

export const defaultSnackProps: MessageProps = {
    Components: { info: StyledInfoSnackbar },
    autoHideDuration: 3000,
    classes: { root: 'min-w-fit' },
    domRoot: document.body,
    maxSnack: 1,
    preventDuplicate: true,
}

export const CopyWrapper: FC<
    PropsWithChildren<{ className?: string; contentToCopy: string; locale: 'en' | 'no'; snackProps?: MessageProps }>
> = ({ className, contentToCopy, locale, snackProps, children }) => {
    return (
        <div className={cn('flex items-center gap-2 hover:text-gama-500', className)}>
            {children}
            <StyledTooltip title={locale === 'no' ? 'Kopier' : 'Copy'}>
                <div>
                    <StyledButton dataTest='copy-button' size='small' variant='text' className='cursor-pointer'>
                        <ContentCopyIcon
                            width={20}
                            height={20}
                            className='text-gama-500 hover:text-delta-700'
                            onClick={() => {
                                navigator.clipboard.writeText(contentToCopy).then(() => {
                                    message.info(
                                        locale === 'no' ? 'Kopieres til utklippstavlen' : 'Copied to clipboard',
                                        {
                                            ...defaultSnackProps,
                                            ...snackProps,
                                        },
                                    )
                                })
                            }}
                        />
                    </StyledButton>
                </div>
            </StyledTooltip>
        </div>
    )
}
