import { MenuItem, type MenuItemProps } from '@mui/material'
import { CheckIcon } from 'src/components/icons'
export const StyledSelectItem = (item: MenuItemProps): JSX.Element => {
    return (
        <MenuItem
            {...item}
            sx={{
                '&.MuiMenuItem-root': {
                    fontSize: 'var(--font-size-body-base) !important',
                    gap: '4px',
                    px: 1,
                },
                '&.Mui-selected': {
                    backgroundColor: 'var(--colors-gama-50) !important',
                },
            }}
        >
            <span style={{ width: '24px', justifyContent: 'center', display: 'flex' }}>
                {item.selected && <CheckIcon width={22} height={22} style={{ color: 'var(--colors-gama-500)' }} />}
            </span>
            <span>{item.children}</span>
        </MenuItem>
    )
}
