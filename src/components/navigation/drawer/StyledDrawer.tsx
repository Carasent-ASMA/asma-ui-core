import { Drawer, type DrawerProps } from '@mui/material'
import type { FC } from 'react'

export const StyledDrawer: FC<DrawerProps & { dataTest?: string }> = ({dataTest, ...props}) => <Drawer data-test={dataTest} {...props} />
