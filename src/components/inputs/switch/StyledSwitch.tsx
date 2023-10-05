import { Switch, type SwitchProps as _SwitchProps } from '@mui/material'
export type SwitchProps = _SwitchProps
export const StyledSwitch = (props: SwitchProps) => (
    <Switch
        {...props}
        sx={{
            '& .MuiButtonBase-root.Mui-checked': {
                color: 'var(--colors-gama-500) !important',
            },
            '& .MuiSwitch-thumb': {
                backgroundColor: 'var(--colors-gama-500) !important',
            },
            '& .Mui-checked+.MuiSwitch-track': {
                backgroundColor: 'var(--colors-gama-500) !important',
            },
        }}
    />
)
