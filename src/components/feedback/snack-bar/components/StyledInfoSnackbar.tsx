import type { AlertColor } from '../StyledAlert'
import clsx from 'clsx'
import { SnackbarContent, type CustomContentProps, useSnackbar } from 'notistack'
import { forwardRef } from 'react'

import { omit } from 'src/helpers'
import { CloseIcon, LoadingIcon } from 'src/components/icons'

interface StyledInfoSnackbarProps extends CustomContentProps {
    severity?: AlertColor
    alertClassName?: string
    alertVariant?: 'standard' | 'filled' | 'outlined'
    closeButton?: boolean
    type?: 'loading'
}

export const StyledInfoSnackbar = forwardRef<HTMLDivElement, StyledInfoSnackbarProps>((props, ref) => {
    const { id, message, closeButton, type, ...other } = omit(props, [
        'anchorOrigin',
        'autoHideDuration',
        'hideIconVariant',
        'iconVariant',
        'persist',
    ] as const)

    const { closeSnackbar } = useSnackbar()
    const isLoading = type === 'loading'

    return (
        <SnackbarContent ref={ref} role='alert' {...other}>
            <div
                className={clsx(
                    'relative flex w-full items-center justify-center',
                    isLoading && 'pl-8',
                    closeButton && 'pr-8',
                )}
            >
                {isLoading ? (
                    <LoadingIcon width={20} height={20} className='absolute left-0 top-1/2 -translate-y-1/2' />
                ) : null}
                <div>{message}</div>
                {closeButton ? (
                    <CloseIcon
                        onClick={() => closeSnackbar(id)}
                        width={20}
                        height={20}
                        className='absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer rounded hover:bg-white/20'
                    />
                ) : null}
            </div>
        </SnackbarContent>
    )
})
