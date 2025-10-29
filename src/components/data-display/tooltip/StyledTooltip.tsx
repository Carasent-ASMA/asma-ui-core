import { Tooltip, type TooltipProps } from '@mui/material'
import Fade from '@mui/material/Fade'

export const StyledTooltip = (props: TooltipProps) => {
    const { componentsProps, ...rest } = props
    const userTooltip = componentsProps?.tooltip

    return (
        <Tooltip
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 300 }}
            placement='top'
            componentsProps={{
                ...componentsProps,
                tooltip: {
                    ...(userTooltip ?? {}),
                    style: { ...(userTooltip?.style || {}) },
                    sx: {
                        borderRadius: '3px',
                        '& .MuiTooltip-arrow': { color: '#363E4A' },
                        color: 'white',
                        boxShadow: '0px 1px 4px 0px rgba(0, 0, 0, 0.25)',
                        display: 'flex',
                        padding: '4px 8px',
                        alignItems: 'center',
                        fontSize: '12px',
                        lineHeight: '16px',
                        letterSpacing: '0.24px',
                        bgcolor: '#363E4A',
                        wordBreak: 'break-word',
                        ...userTooltip?.sx,
                    },
                },
            }}
            {...rest}
        />
    )
}
