import { Tooltip, type TooltipProps } from '@mui/material'
import Fade from '@mui/material/Fade'

export const StyledTooltip = (props: TooltipProps) => (
    <Tooltip
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
        arrow placement='top'
        componentsProps={{
            tooltip: {
                sx: {
                    bgcolor: 'var(--colors-gray-800)',
                    borderRadius: '3px',
                    '& .MuiTooltip-arrow': {
                        color: 'var(--colors-gray-800)',
                    },
                },
            },
        }}
        {...props}
    />
)
