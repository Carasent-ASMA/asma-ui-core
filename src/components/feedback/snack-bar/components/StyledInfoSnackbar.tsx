import type { AlertColor } from '@mui/material'
import clsx from 'clsx'
import { SnackbarContent, type CustomContentProps, useSnackbar } from 'notistack'
import { forwardRef } from 'react'
import { CloseIcon, LoadingIcon } from 'src/components/icons'
import { omit } from 'src/helpers'

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
    ])

    const { closeSnackbar } = useSnackbar()

    const handleClose = () => closeSnackbar(id)

    const isLoading = type === 'loading'

    return (
        <SnackbarContent ref={ref} role='alert' {...other}>
            <div
                className={clsx('flex items-center justify-center w-full', isLoading && 'pl-6', closeButton && 'pr-6')}
            >
                {type === 'loading' ? (
                    <LoadingIcon width={20} height={20} className='left-2 absolute top-1/2 -translate-y-1/2' />
                ) : null}
                <div>{message}</div>
                {closeButton ? (
                    <CloseIcon
                        onClick={() => handleClose()}
                        width={20}
                        height={20}
                        className='right-2 absolute top-1/2 -translate-y-1/2'
                    />
                ) : null}
            </div>
        </SnackbarContent>
    )
})
