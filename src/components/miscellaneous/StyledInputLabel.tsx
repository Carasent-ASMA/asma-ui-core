import { InputLabel, type InputLabelProps } from '@mui/material'

export interface StyledInputLabelProps extends InputLabelProps {
    dataTest?: string
}

export const StyledInputLabel = ({dataTest, ...props}: StyledInputLabelProps) => <InputLabel data-test={dataTest} {...props} />
