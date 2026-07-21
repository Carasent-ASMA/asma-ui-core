import type { FC } from 'react'
import { StyledButton, StyledTooltip } from 'src'
import { ArrowExpandIcon, ArrowShrinkIcon } from 'src/components/icons'

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
                    onClick={(event) => {
                        onClick()

                        if (event.detail !== 0) {
                            event.currentTarget.blur()
                        }
                    }}
                    endIcon={
                        fullScreen ? (
                            <ArrowShrinkIcon width={20} height={20} color='text-delta-700' />
                        ) : (
                            <ArrowExpandIcon width={20} height={20} color='text-delta-700' />
                        )
                    }
                />
            </div>
        </StyledTooltip>
    )
}
