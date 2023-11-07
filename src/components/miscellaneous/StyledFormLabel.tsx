import { FormLabel, type FormLabelProps } from '@mui/material'

export const StyledFormLabel = ({dataTest, ...props}: FormLabelProps & { dataTest?: string }) => <FormLabel data-test={dataTest} {...props} />
