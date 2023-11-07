import { FormControlLabel, type FormControlLabelProps } from '@mui/material'

export const StyledFormControlLabel = ({dataTest, ...props}: FormControlLabelProps & { dataTest?: string }) => <FormControlLabel data-test={dataTest} {...props} />
