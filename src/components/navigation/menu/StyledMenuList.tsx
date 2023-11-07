import { MenuList, type MenuListProps } from '@mui/material'

export const StyledMenuList = ({dataTest, ...props}: MenuListProps & { dataTest?: string }) => <MenuList data-test={dataTest} {...props} />
