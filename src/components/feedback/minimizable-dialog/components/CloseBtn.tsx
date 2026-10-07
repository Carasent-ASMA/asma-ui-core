import React from 'react'
import { StyledTooltip } from 'src/components/data-display/tooltip'
import { CloseIcon } from 'src/components/icons'
import { StyledButton } from 'src/components/inputs/button'

export const CloseBtn: React.FC<{
    showCloseIcon: boolean
    onClick: () => void
    tooltipTitle: string
    buttonRef?: React.Ref<HTMLButtonElement>
    /** While set, the button is soft-disabled with this reason (e.g. a save is running). */
    disabledReason?: React.ReactNode
}> = ({ showCloseIcon, tooltipTitle, onClick, buttonRef, disabledReason }) => {
    if (!showCloseIcon) return null

    return (
        <StyledTooltip title={tooltipTitle} placement='top' open={disabledReason ? false : undefined}>
            <div>
                <StyledButton
                    dataTest='close-button'
                    refLink={buttonRef}
                    aria-label={tooltipTitle}
                    variant='textGray'
                    size='small'
                    disabled={Boolean(disabledReason)}
                    disabledReason={disabledReason}
                    onClick={onClick}
                    endIcon={<CloseIcon height={20} width={20} color='text-delta-700' />}
                />
            </div>
        </StyledTooltip>
    )
}
