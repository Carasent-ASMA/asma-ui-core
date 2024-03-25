import { FormControl, type FormControlProps } from '@mui/material'

export const StyledFormControl = (props: FormControlProps) => (
    <FormControl
        {...props}
        sx={{
            ...props.sx,
            '& label.MuiInputLabel-shrink': {
                background: 'white !important',
                color: 'var(--colors-delta-500) !important',
            },
            '& label.MuiInputLabel-shrink.Mui-focused': {
                background: 'white !important',
                color: 'var(--colors-gama-500) !important',
            },
            '& label.MuiInputLabel-shrink.Mui-error.Mui-focused': {
                background: 'white !important',
                color: 'var(--colors-red-500) !important',
            },
        }}
    />
)
