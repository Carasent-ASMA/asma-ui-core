import { Dialog } from '@mui/material'
import type { DialogProps } from '@mui/material/Dialog'

import { styled } from '@mui/material/styles'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import { StyledButton } from '../inputs'

export interface IStyledDialogProps extends DialogProps {
    onCloseText?: string
    showCloseIcon?: boolean
}

export const StyledDialog = styled(
    ({ onCloseText, children, onClose, showCloseIcon = true, ...rest }: IStyledDialogProps) => {
        return (
            <Dialog
                {...rest}
                onClose={onClose}
                style={{
                    zIndex: 999,
                }}
            >
                <div className={clsx('w-full p-4 sm:min-w-[20rem] md:min-w-[37.5rem]')}>
                    <div className={'mb-2 flex h-10 justify-end'}>
                        {showCloseIcon ? (
                            <StyledButton
                                variant='text'
                                endIcon={<Icon icon={'ic:baseline-close'} className={'text-2xl'} />}
                                onClick={(event) => {
                                    onClose ? onClose(event, 'escapeKeyDown') : null
                                }}
                                className={'text-gray-800'}
                            >
                                {onCloseText}
                            </StyledButton>
                        ) : null}
                    </div>
                    <div className={'px-4'}>{children}</div>
                </div>
            </Dialog>
        )
    },
)``
