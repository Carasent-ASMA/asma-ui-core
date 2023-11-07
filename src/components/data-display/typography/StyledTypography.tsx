import { Typography, type TypographyProps } from '@mui/material'

export interface StyledTypographyProps extends TypographyProps {
    dataTest?: string
}

export const StyledTypography = ({dataTest, ...props}: StyledTypographyProps) => <Typography data-test={dataTest} {...props} />
