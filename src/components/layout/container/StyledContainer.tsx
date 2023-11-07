import { type ContainerProps, Container } from '@mui/material'
import type { FC } from 'react'

export const StyledContainer: FC<ContainerProps & { dataTest?: string }> = ({dataTest, ...props}) => <Container data-test={dataTest} {...props} />
