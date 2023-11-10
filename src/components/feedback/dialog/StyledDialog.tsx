import { Dialog } from '@mui/material'
import type { DialogProps } from '@mui/material/Dialog'

import { Icon } from '@iconify/react'
import { StyledButton } from '../../inputs/button/StyledButton'
import type { ReactNode } from 'react'

export interface IStyledDialogProps extends DialogProps {
    onCloseText?: ReactNode
    showCloseIcon?: boolean
    dataTest: string
}

export const StyledDialog: React.FC<IStyledDialogProps> = ({
    onCloseText,
    children,
    onClose,
    dataTest,
    showCloseIcon = true,
    ...rest
}) => {
    return (
        <Dialog
            {...rest}
            data-test={dataTest}
            onClose={onClose}
            style={{
                zIndex: 999,
                ...rest.style,
            }}
        >
            {showCloseIcon && (
                <div className={'mr-2 mt-2 flex justify-end'}>
                    <StyledButton
                        dataTest={`close-button-${dataTest}`}
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
}
