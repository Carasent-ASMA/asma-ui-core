import { Tooltip, type TooltipProps } from '@mui/material'
import Fade from '@mui/material/Fade'

export const StyledTooltip = (props: TooltipProps) => (
    <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 300 }} arrow placement='top' {...props} />
)
