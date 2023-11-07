import { Stack, type StackProps } from '@mui/material'

export interface StyledStackProps extends StackProps {
    dataTest?: string
}

export const StyledStack = ({dataTest, ...props}: StyledStackProps) => <Stack data-test={dataTest} {...props} />
