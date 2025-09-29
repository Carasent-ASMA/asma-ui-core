import type { FC } from 'react'
import { StyledButton, StyledTooltip } from 'src'
import { ArrowExpand } from 'src/components/icons/arrow-expand'
import { ArrowShrink } from 'src/components/icons/arrow-shrink'

export const FullScreenBtn: FC<{
    fullScreen: boolean
    showFullScreenIcon: boolean
    tooltipTitle: string
    onClick: () => void
}> = ({ fullScreen, showFullScreenIcon, tooltipTitle, onClick }) => {
    if (!showFullScreenIcon) return null

    return (
        <StyledTooltip title={tooltipTitle}>
            <div>
                <StyledButton
                    dataTest='fullscreen-button'
                    variant='textGray'
                    size='small'
                    onClick={onClick}
                    endIcon={
                        fullScreen ? (
                            <ArrowShrink width={20} height={20} color='text-delta-700' />
                        ) : (
                            <ArrowExpand width={20} height={20} color='text-delta-700' />
                        )
                    }
                />
            </div>
        </StyledTooltip>
    )
}
