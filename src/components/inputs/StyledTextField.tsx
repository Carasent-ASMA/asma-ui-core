import { FormControl, type FormControlProps, TextField, type TextFieldProps } from '@mui/material'

import { styled } from '@mui/material/styles'
import { StyledFormLabel } from './StyledFormLabel'

type StyledTextFieldProps = TextFieldProps & {
    FormControlProps?: FormControlProps
}

export const StyledTextField = styled(
    ({ FormControlProps, InputLabelProps, label, size = 'small', ...props }: StyledTextFieldProps) => (
        <FormControl {...FormControlProps}>
            <StyledFormLabel id={`${props.id}-label`} {...InputLabelProps}>
                {label}
            </StyledFormLabel>
            <TextField aria-labelledby={`${props.id}-label`} {...props} size={size} />
        </FormControl>
    ),
)`
    & .MuiOutlinedInput-root {
        & fieldset {
            border-color: #626e7e;
        }
    }
`
