import { Switch, type SwitchProps as _SwitchProps } from '@mui/material'
export type SwitchProps = _SwitchProps
export const StyledSwitch = ({ dataTest, ...props }: SwitchProps & { dataTest: string }) => (
    <Switch
        {...props}
        data-test={dataTest}
        sx={{
            // Checked
            '& .MuiButtonBase-root.Mui-checked': {
                color: 'var(--colors-gama-500) !important',
            },
            '& .MuiSwitch-track': {
                backgroundColor: 'var(--colors-delta-400) !important',
                opacity: '1 !important',
            },

            '& .MuiSwitch-thumb': {
                backgroundColor: 'var(--colors-gama-500) !important',
            },

            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: 'var(--colors-gama-200) !important',
            },
            '& .PrivateSwitchBase-input.MuiSwitch-input': {
                height: '100% !important',
            },

            // Unchecked
            '& .MuiSwitch-input:not(:checked) ~ .MuiSwitch-thumb': {
                backgroundColor: 'var(--colors-gray-10) !important',
                outline: '1px solid var(--colors-delta-200)',
            },

            // Disabled + Unchecked
            '& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track': {
                backgroundColor: 'var(--colors-delta-200) !important',
                opacity: '1 !important',
            },
            '& .MuiSwitch-switchBase.Mui-disabled .MuiSwitch-thumb': {
                backgroundColor: 'var(--colors-delta-50) !important',
                opacity: '1 !important',
            },

            // Disabled + Checked
            '& .MuiSwitch-switchBase.Mui-checked.Mui-disabled + .MuiSwitch-track': {
                backgroundColor: 'var(--colors-gama-100) !important',
                opacity: '1 !important',
            },
            '& .MuiSwitch-switchBase.Mui-checked.Mui-disabled .MuiSwitch-thumb': {
                backgroundColor: 'var(--colors-gama-300) !important',
                opacity: '1 !important',
            },
        }}
    />
)
