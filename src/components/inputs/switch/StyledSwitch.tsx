import { Switch, type SwitchProps as _SwitchProps } from '@mui/material'
export type SwitchProps = _SwitchProps
export const StyledSwitch = ({dataTest, ...props}: SwitchProps & { dataTest: string }) => (
    <Switch
        {...props}
        data-test={dataTest}
        sx={{
            '& .MuiButtonBase-root.Mui-checked': {
                color: 'var(--colors-gama-500) !important',
            },
            '& .Mui-disabled .MuiSwitch-thumb': {
                backgroundColor: 'var(--colors-gama-200) !important',
            },
            '& .MuiSwitch-thumb': {
                backgroundColor: 'var(--colors-gama-500) !important',
            },
            '& .MuiSwitch-input:not(:checked) ~ .MuiSwitch-thumb': {
                backgroundColor: 'var(--colors-gray-10) !important',
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: 'var(--colors-gama-200) !important',
            },
            '& .PrivateSwitchBase-input.MuiSwitch-input': {
                height: '100% !important',
            },
        }}
    />
)
