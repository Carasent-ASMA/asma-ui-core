import { MenuItem, type MenuItemProps } from '@mui/material'
import { Icon } from '@iconify/react'
export const StyledSelectItem = (item: MenuItemProps) => {
    return (
        <MenuItem
            {...item}
            sx={{
                '&.MuiMenuItem-root': {
                    fontSize: '14px !important',
                    gap: '4px',
                    px: 1,
                },
                '&.Mui-selected': {
                    backgroundColor: 'var(--colors-gama-50) !important',
                },
            }}
        >
            <span style={{ width: '24px', justifyContent: 'center', display: 'flex' }}>
                {item.selected && (
                    <Icon icon='mdi:tick' width={22} height={22} style={{ color: 'var(--colors-gama-500)' }} />
                )}
            </span>
            <span>{item.children}</span>
        </MenuItem>
    )
}
