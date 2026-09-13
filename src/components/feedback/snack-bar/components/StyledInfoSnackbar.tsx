import clsx from 'clsx'
import { SnackbarContent, useSnackbar, type CustomContentProps } from 'notistack'
import { forwardRef } from 'react'
import type { AlertColor } from '../StyledAlert'

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
    ] as const)

    const { closeSnackbar } = useSnackbar()
    const isLoading = type === 'loading'

    return (
        <SnackbarContent ref={ref} role='alert' {...other}>
            <div
                className={clsx(
                    'flex w-full items-center justify-center gap-1',
                )}
            >
                {isLoading ? (
                    <LoadingIcon width={24} height={24}/>
                ) : null}
                <div className={typeof message === 'string' || typeof message === 'number' ? 'pl-1 pr-2' : undefined}>
                    {message}
                </div>
                {closeButton ? (
                    <button
                        aria-label='Close'
                        className='grid size-8 cursor-pointer place-items-center rounded border-0 bg-transparent text-white transition-colors duration-300 ease-in-out hover:bg-gama-500 active:bg-gama-500'
                        onClick={() => closeSnackbar(id)}
                        type='button'
                    >
                        <CloseIcon width={20} height={20} />
                    </button>
                ) : null}
            </div>
        </SnackbarContent>
    )
})
