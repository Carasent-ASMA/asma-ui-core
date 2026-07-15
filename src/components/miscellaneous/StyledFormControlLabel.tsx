import { FormControlLabel, type FormControlLabelProps } from '@mui/material'

export const StyledFormControlLabel = ({ sx, ...props }: FormControlLabelProps): JSX.Element => (
    <FormControlLabel
        {...props}
        sx={{
            color: 'var(--colors-delta-800)',
            margin: 0,
            '& .MuiFormControlLabel-label': {
                fontSize: 'var(--font-size-body-base)',
                lineHeight: 'var(--line-height-body-base)',
            },
            '&.Mui-disabled .MuiFormControlLabel-label': {
                color: 'var(--colors-delta-300)', // custom color for disabled label
            },
            ...sx,
        }}
    />
)
