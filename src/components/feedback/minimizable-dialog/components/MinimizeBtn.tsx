import { StyledTooltip } from 'src/components/data-display/tooltip'
import { KeyboardCapslockIcon, MinimizeIcon } from 'src/components/icons'
import { StyledButton } from 'src/components/inputs/button'

export const MinimizeBtn: React.FC<{
    type: 'expand' | 'minimize'
    visibility: boolean
    onClick: () => void
    tooltipTitle: string
}> = ({ visibility, tooltipTitle, onClick, type }) => {
    if (!visibility) return null

    const isExpandBtn = type === 'expand'
    const isMinBtn = type === 'minimize'

    if (isExpandBtn)
        return (
            <div>
                <StyledTooltip title={tooltipTitle} placement='top'>
                    <div>
                        <StyledButton
                            dataTest='toggle-minimize-btn'
                            variant='text'
                            size='small'
                            onClick={onClick}
                            endIcon={<KeyboardCapslockIcon height={20} width={20} color='text-gama-500' />}
                        />
                    </div>
                </StyledTooltip>
            </div>
        )

    if (isMinBtn)
        return (
            <div>
                <StyledTooltip title={tooltipTitle} placement='top'>
                    <div>
                        <StyledButton
                            dataTest='toggle-minimize-btn'
                            variant='textGray'
                            size='small'
                            onClick={onClick}
                            endIcon={<MinimizeIcon height={20} width={20} color='text-delta-700' />}
                        />
                    </div>
                </StyledTooltip>
            </div>
        )

    return null
}
