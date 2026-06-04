import { Tooltip, type SxProps, type Theme, type TooltipProps } from '@mui/material'
import Fade from '@mui/material/Fade'

interface TooltipSlotObj extends React.HTMLAttributes<HTMLDivElement> {
    sx?: SxProps<Theme>
}

export const StyledTooltip = (props: TooltipProps): JSX.Element => {
    const { slotProps, ...rest } = props
    const userTooltip = slotProps?.tooltip as TooltipSlotObj | undefined

    return (
        <Tooltip
            slots={{ transition: Fade }}
            slotProps={{
                ...slotProps,
                transition: { timeout: 300, ...(slotProps?.transition ?? {}) },
                tooltip: {
                    ...(userTooltip ?? {}),
                    style: { ...(userTooltip?.style ?? {}) },
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
            enterDelay={500}
            placement='top'
            {...rest}
        />
    )
}
