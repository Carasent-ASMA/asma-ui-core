import { Tooltip, type TooltipProps } from '@mui/material'
import Fade from '@mui/material/Fade'
import { styled } from '@mui/material/styles'

export const StyledTooltip = styled((props: TooltipProps) => (
    <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 300 }} arrow placement='top' {...props} />
))``
