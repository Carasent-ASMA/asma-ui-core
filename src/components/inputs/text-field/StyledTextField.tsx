import { FormControl, type FormControlProps, TextField, type TextFieldProps } from '@mui/material'

import { StyledFormLabel } from '../../miscellaneous/StyledFormLabel'

type StyledTextFieldProps = TextFieldProps & {
    FormControlProps?: FormControlProps
}

/**
 * @deprecated This component is deprecated. Please use the `StyledInputField` component instead.
 * This component will be removed in the next major version, so please update your code accordingly.
 */
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
                root: `[&_fieldset]:!border-delta-600`,
            }}
        />
    </FormControl>
)
