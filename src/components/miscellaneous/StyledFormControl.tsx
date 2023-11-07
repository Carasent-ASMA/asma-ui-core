import { FormControl, type FormControlProps } from '@mui/material'

export const StyledFormControl = (props: FormControlProps) => (
    <FormControl
        {...props}
        sx={{
            ...props.sx,
            '& label': {
                top: '-7px !important',
            },
            '& label.MuiInputLabel-shrink': {
                top: '0px !important',
                background: 'white !important',
                color: 'var(--colors-delta-500) !important',
            },
        }}
    />
)
