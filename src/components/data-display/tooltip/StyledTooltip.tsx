import { Tooltip, type TooltipProps } from '@mui/material'
import Fade from '@mui/material/Fade'

export interface StyledTooltipProps extends TooltipProps {
    dataTest?: string
}

export const StyledTooltip = ({  dataTest, ...props }: StyledTooltipProps) => (
    <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 300 }} arrow placement='top' data-test={dataTest} {...props} />
)
