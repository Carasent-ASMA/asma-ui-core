import { Checkbox, type CheckboxProps } from '@mui/material'

export const StyledCheckbox: React.FC<CheckboxProps & { dataTest: string }> = ({ dataTest, ...props }) => (
    <Checkbox
        {...props}
        data-test={dataTest}
        sx={{
            ...props.sx,
            '&.MuiCheckbox-root': {
                color: 'var(--colors-delta-500) !important',
            },
            '&.MuiCheckbox-root.Mui-checked': {
                color: 'var(--colors-gama-500) !important',
            },
            '&.MuiCheckbox-root.MuiCheckbox-indeterminate': {
                color: 'var(--colors-gama-500) !important',
            },
            '&.MuiCheckbox-root.Mui-disabled': {
                color: 'var(--colors-delta-200) !important',
            },
            '&.MuiCheckbox-root .PrivateSwitchBase-input': {
                height: '100% !important',
                width: '100% !important',
            },
        }}
    />
)
