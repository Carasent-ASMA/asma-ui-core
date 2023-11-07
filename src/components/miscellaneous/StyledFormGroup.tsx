import { FormGroup, type FormGroupProps } from '@mui/material'

export const StyledFormGroup: React.FC<FormGroupProps & { dataTest?: string }> = ({dataTest, ...props}) => {
    return <FormGroup data-test={dataTest} {...props} />
}
