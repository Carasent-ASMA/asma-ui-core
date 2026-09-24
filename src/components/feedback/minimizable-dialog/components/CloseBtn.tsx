import React from 'react'
import { StyledTooltip } from 'src/components/data-display/tooltip'
import { CloseIcon } from 'src/components/icons'
import { StyledButton } from 'src/components/inputs/button'

export const CloseBtn: React.FC<{
    showCloseIcon: boolean
    onClick: () => void
    tooltipTitle: string
    buttonRef?: React.Ref<HTMLButtonElement>
}> = ({ showCloseIcon, tooltipTitle, onClick, buttonRef }) => {
    if (!showCloseIcon) return null

    return (
        <StyledTooltip title={tooltipTitle} placement='top'>
            <div>
                <StyledButton
                    dataTest='close-button'
                    refLink={buttonRef}
                    aria-label={tooltipTitle}
                    variant='textGray'
                    size='small'
                    onClick={onClick}
                    endIcon={<CloseIcon height={20} width={20} color='text-delta-700' />}
                />
            </div>
        </StyledTooltip>
    )
}
