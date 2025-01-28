import { Tooltip, type TooltipProps } from '@mui/material'
import Fade from '@mui/material/Fade'

export const StyledTooltip = (props: TooltipProps) => (
    <Tooltip
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
        arrow
        placement='top'
        componentsProps={{
            tooltip: {
                sx: {
                    borderRadius: '3px !important',
                    '& .MuiTooltip-arrow': {
                        color: '#363E4A !important',
                    },
                    color: 'white !important',
                    boxShadow: '0px 1px 4px 0px rgba(0, 0, 0, 0.25) !important',
                    display: 'flex !important',
                    padding: '4px 8px !important',
                    alignItems: 'center !important',
                    fontSize: '12px !important',
                    lineHeight: '16px !important',
                    letterSpacing: ' 0.24px !important',
                    bgcolor: '#363E4A !important',
                    wordBreak: 'break-word !important',
                },
            },
        }}
        {...props}
    />
)
