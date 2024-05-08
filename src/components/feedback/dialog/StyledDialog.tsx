import { Dialog } from '@mui/material'
import type { DialogProps } from '@mui/material/Dialog'

import { StyledButton } from '../../inputs/button/StyledButton'
import type { ReactNode } from 'react'
import './StyledDialog.scss'
import { CloseIcon } from 'src/components/icons'
export interface IStyledDialogProps extends DialogProps {
    onCloseText?: ReactNode
    showCloseIcon?: boolean
    dataTest: string
    dialogLabel?: ReactNode
    dialogTitle?: ReactNode
}

export const StyledDialog: React.FC<IStyledDialogProps> = ({
    onCloseText,
    children,
    dataTest,
    showCloseIcon = true,
    dialogLabel,
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
            <div className={'styled-dialog-root'}>
                <div className='styled-top-header'>
                    <div className={'styled-dialog-info'}>
                        {dialogLabel && <div className={'styled-dialog-label'}>{dialogLabel}</div>}
                        {dialogTitle && <div className={'styled-dialog-title'}>{dialogTitle}</div>}
                    </div>
                    {showCloseIcon && (
                        <div className={'styled-dialog-close'}>
                            <StyledButton
                                dataTest={`close-button-${dataTest}`}
                                variant='textGray'
                                size='small'
                                endIcon={<CloseIcon width={24} height={24} />}
                                onClick={(event) => {
                                    rest.onClose ? rest.onClose(event, 'escapeKeyDown') : null
                                }}
                                style={{ color: 'var(--colors-grey-800)' }}
                            >
                                {onCloseText}
                            </StyledButton>
                        </div>
                    )}
                </div>
            </div>

            {children}
        </Dialog>
    )
}
