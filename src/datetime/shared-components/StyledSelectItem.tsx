import { MenuItem, type MenuItemProps } from '@mui/material'

export const StyledSelectItem = (item: MenuItemProps): JSX.Element => {
    return (
        <MenuItem
            {...item}
            sx={{
                '&.MuiMenuItem-root': {
                    fontSize: '14px !important',
                },
                '&.Mui-selected': {
                    backgroundColor: 'var(--colors-gama-50) !important',
                },
            }}
        >
            {item.children}
        </MenuItem>
    )
}
