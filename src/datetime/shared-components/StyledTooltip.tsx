import { Fade, Tooltip, type SxProps, type Theme, type TooltipProps } from '@mui/material'
import { mergeSlotProps } from '@mui/material/utils'

const defaultTooltipSx: SxProps<Theme> = {
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
}

export const StyledTooltip = (props: TooltipProps): JSX.Element => {
    const { slotProps, ...rest } = props

    return (
        <Tooltip
            placement='top'
            {...rest}
            slots={{ transition: Fade }}
            slotProps={{
                ...slotProps,
                transition: mergeSlotProps(slotProps?.transition, { timeout: 300 }),
                tooltip: mergeSlotProps(slotProps?.tooltip, { sx: defaultTooltipSx }),
            }}
        />
    )
}
