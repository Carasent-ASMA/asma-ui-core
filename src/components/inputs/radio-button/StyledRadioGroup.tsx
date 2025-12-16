import { RadioGroup, type RadioGroupProps } from '@mui/material'

export const StyledRadioGroup = ({ dataTest, ...props }: RadioGroupProps & { dataTest: string }): JSX.Element => (
    <RadioGroup data-test={dataTest} {...props} />
)
