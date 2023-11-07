import { FormHelperText, type FormHelperTextProps } from '@mui/material'

export interface StyledFormHelperTextProps extends FormHelperTextProps {
    dataTest?: string
}

export const StyledFormHelperText = ({dataTest, ...props}: StyledFormHelperTextProps) => <FormHelperText data-test={dataTest} {...props} />
