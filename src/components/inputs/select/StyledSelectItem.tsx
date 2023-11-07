import { MenuItem, type MenuItemProps } from '@mui/material'

export const StyledSelectItem = ({dataTest, ...item}: MenuItemProps & { dataTest?: string }) => {
    return (
        <MenuItem
            {...item}
            data-test={dataTest}
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
