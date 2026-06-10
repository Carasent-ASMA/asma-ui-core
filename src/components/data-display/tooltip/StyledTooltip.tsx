import { Tooltip, type SxProps, type Theme, type TooltipProps } from '@mui/material'
import { mergeSlotProps } from '@mui/material/utils'
import Fade from '@mui/material/Fade'

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
            enterDelay={500}
            placement='top'
            {...rest}  // сначала пользовательские пропы
            slots={{ transition: Fade, ...rest.slots }}  // потом дефолты поверх
            slotProps={{
                ...slotProps,
                transition: mergeSlotProps(slotProps?.transition, { timeout: 300 }),
                tooltip: mergeSlotProps(slotProps?.tooltip, { sx: defaultTooltipSx }),
            }}
        />
    )
}
