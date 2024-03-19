import { Dialog } from '@mui/material'
import type { DialogProps } from '@mui/material/Dialog'

import { Icon } from '@iconify/react'
import { StyledButton } from '../../inputs/button/StyledButton'
import type { ReactNode } from 'react'

export interface IStyledDialogProps extends DialogProps {
    onCloseText?: ReactNode
    showCloseIcon?: boolean
    dataTest: string
    dialogTitle?: ReactNode
}

export const StyledDialog: React.FC<IStyledDialogProps> = ({
    onCloseText,
    children,
    dataTest,
    showCloseIcon = true,
    dialogTitle,
    ...rest
}) => {
    return (
        <Dialog
            {...rest}
            data-test={dataTest}
            style={{
                zIndex: 999,
                ...rest.style,
            }}
        >
            <div className='flex items-center'>
                {dialogTitle && (
                    <div className={'pl-4 pt-2 flex justify-start text-sm text-[var(--colors-gray-700)] '}>
                        {dialogTitle}
                    </div>
                )}
                {showCloseIcon && (
                    <div className={'mr-2 mt-2 flex justify-end flex-grow'}>
                        <StyledButton
                            dataTest={`close-button-${dataTest}`}
                            variant='textGray'
                            endIcon={<Icon icon={'ic:baseline-close'} className={'text-2xl'} />}
                            onClick={(event) => {
                                rest.onClose ? rest.onClose(event, 'escapeKeyDown') : null
                            }}
                            className={'text-gray-800'}
                        >
                            {onCloseText}
                        </StyledButton>
                    </div>
                )}
            </div>

            {children}
        </Dialog>
    )
}
