import { FormControl, type FormControlProps, TextField, type TextFieldProps } from '@mui/material'

import { StyledFormLabel } from '../../miscellaneous/StyledFormLabel'

type StyledTextFieldProps = TextFieldProps & {
    FormControlProps?: FormControlProps
}

export const StyledTextField = ({
    FormControlProps,
    InputLabelProps,
    label,
    size = 'small',
    ...props
}: StyledTextFieldProps) => (
    <FormControl {...FormControlProps}>
        <StyledFormLabel id={`${props.id}-label`} {...InputLabelProps}>
            {label}
        </StyledFormLabel>
        <TextField
            aria-labelledby={`${props.id}-label`}
            {...props}
            size={size}
            classes={{
                ...props.classes,
                root: `[&_fieldset]:!border-[#626e7e]`,
            }}
        />
    </FormControl>
)
