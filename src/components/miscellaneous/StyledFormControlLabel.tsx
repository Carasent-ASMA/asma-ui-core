import { FormControlLabel, type FormControlLabelProps } from '@mui/material'

export const StyledFormControlLabel = ({ sx, ...props }: FormControlLabelProps) => (
    <FormControlLabel
        {...props}
        sx={{
            color: 'var(--colors-delta-700)',
            '& .MuiFormControlLabel-label': {
                fontSize: '14px',
                lineHeight: '20px',
            },
            '&.Mui-disabled .MuiFormControlLabel-label': {
                color: 'var(--colors-delta-300)', // custom color for disabled label
            },
            ...sx,
        }}
    />
)
