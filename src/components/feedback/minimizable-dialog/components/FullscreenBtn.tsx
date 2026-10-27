import type { FC, ReactNode } from 'react'
import { StyledButton, StyledTooltip } from 'src'
import { ArrowExpandIcon, ArrowShrinkIcon } from 'src/components/icons'

export const FullScreenBtn: FC<{
    fullScreen: boolean
    showFullScreenIcon: boolean
    tooltipTitle: string
    onClick: () => void
    /**
     * While set, the button is soft-disabled with this reason instead of being taken away — a dialog
     * that only exists in fullscreen still shows its exit control, says why it cannot be used and
     * stays focusable. Same contract as `CloseBtn`'s: `StyledButton` renders `aria-disabled`, the
     * not-allowed cursor and the reason on hover, focus and tap.
     */
    disabledReason?: ReactNode
}> = ({ fullScreen, showFullScreenIcon, tooltipTitle, onClick, disabledReason }) => {
    if (!showFullScreenIcon) return null

    return (
        // The reason replaces the plain tooltip while disabled, rather than both opening at once.
        <StyledTooltip title={tooltipTitle} open={disabledReason ? false : undefined}>
            <div>
                <StyledButton
                    dataTest='fullscreen-button'
                    aria-label={tooltipTitle}
                    variant='textGray'
                    size='small'
                    disabled={Boolean(disabledReason)}
                    disabledReason={disabledReason}
                    onClick={onClick}
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
