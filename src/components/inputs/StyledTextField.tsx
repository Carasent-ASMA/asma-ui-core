import { FormControl, TextField, Typography, type TextFieldProps } from '@mui/material'

import { styled } from '@mui/material/styles'
import { StyledFormHelperText } from './StyledFormHelperText'
import { StyledFormLabel } from './StyledFormLabel'
import { StyledInput } from './StyledInput'
import { StyledInputLabel } from './StyledInputLabel'

export const ComposedTextField = styled(
    ({ label, InputLabelProps, InputProps, value, FormHelperTextProps }: TextFieldProps) => (
        <FormControl>
            <StyledInputLabel {...InputLabelProps}>
                <Typography>{label}</Typography>
            </StyledInputLabel>
            <StyledInput value={value} {...InputProps} />
            <StyledFormHelperText {...FormHelperTextProps} />
        </FormControl>
    ),
)``

export const StyledTextField = styled(({ InputLabelProps, label, size = 'small', ...props }: TextFieldProps) => (
    <FormControl>
        <StyledFormLabel id={`${props.id}-label`} {...InputLabelProps}>
            {label}
        </StyledFormLabel>
        <TextField aria-labelledby={`${props.id}-label`} {...props} size={size} />
    </FormControl>
))``
