import { Switch, type SwitchProps as _SwitchProps } from '@mui/material'
export type SwitchProps = _SwitchProps
export const StyledSwitch = (props: SwitchProps) => (
    <Switch
        {...props}
        sx={{
            '& .MuiSwitch-thumb': {
                backgroundColor: 'var(--colors-gama-500)',
            },
            '& .Mui-checked+.MuiSwitch-track': {
                backgroundColor: 'var(--colors-gama-500)',
            },
        }}
    />
)
