import { MenuItem, type MenuItemProps } from '@mui/material'

export const StyledSelectItem = (item: MenuItemProps) => {
    return <MenuItem {...item}>{item.children}</MenuItem>
}
