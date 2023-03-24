import { FormControl, TextField, type TextFieldProps } from '@mui/material'

import { styled } from '@mui/material/styles'
import { StyledFormLabel } from './StyledFormLabel'

export const StyledTextField = styled(({ InputLabelProps, label, size = 'small', ...props }: TextFieldProps) => (
    <FormControl>
        <StyledFormLabel id={`${props.id}-label`} {...InputLabelProps}>
            {label}
        </StyledFormLabel>
        <TextField aria-labelledby={`${props.id}-label`} {...props} size={size} />
    </FormControl>
))``
