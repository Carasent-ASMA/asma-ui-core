import { TextField, type TextFieldProps } from '@mui/material'

/**
 *
 * @inputRef
 * inputRef to get Node of Input Element inside
 *
 */
export const StyledInputField = (props: TextFieldProps) => (
    <TextField
        {...props}
        sx={{
            ...props.sx,
            '& .MuiInputBase-colorPrimary.Mui-focused fieldset': {
                borderColor: 'var(--colors-gama-500) !important',
            },
            '& .MuiInputBase-colorPrimary.Mui-focused.Mui-error fieldset': {
                borderColor: '#d3302f !important',
            },
            '& .MuiInputBase-colorPrimary.Mui-disabled fieldset': {
                borderColor: 'var(--colors-delta-300) !important',
            },
            '& label.Mui-focused': {
                color: 'var(--colors-gama-500) !important',
            },
            '& label.Mui-focused.Mui-error': {
                color: '#d3302f !important',
            },
            '& label.Mui-disabled': {
                color: 'var(--colors-delta-300) !important',
            },

            '& .MuiInputBase-inputSizeSmall': {
                fontSize: '14px',
                height: '23px',
            },
            '& .MuiInputBase-input': {
                fontSize: '14px',
                height: '23px',
            },
            '& .MuiOutlinedInput-input.Mui-disabled': {
                WebkitTextFillColor: 'var(--colors-delta-300) !important',
            },
        }}
    />
)
