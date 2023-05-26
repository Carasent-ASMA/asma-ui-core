import { Dialog } from '@mui/material'
import type { DialogProps } from '@mui/material/Dialog'

import { styled } from '@mui/material/styles'
import { Icon } from '@iconify/react'
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
                {showCloseIcon && (
                    <div className={'mr-2 mt-2 flex justify-end'}>
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
                    </div>
                )}

                {children}
            </Dialog>
        )
    },
)``
