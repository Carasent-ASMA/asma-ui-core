import { FormControl, type FormControlProps } from '@mui/material'

export interface StyledFormControlProps extends FormControlProps {
    dataTest?: string
}

export const StyledFormControl = ({dataTest, ...props}: StyledFormControlProps) => <FormControl data-test={dataTest} {...props} />
