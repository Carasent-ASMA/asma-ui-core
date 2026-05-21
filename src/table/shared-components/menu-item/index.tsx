import { MenuItem } from '@mui/material'
import type { MenuItemProps } from '@mui/material'
import { CheckIcon } from '../CheckIcon'

export const StyledMenuItem = (props: MenuItemProps) => (
    <MenuItem
        classes={{ root: 'flex gap-x-1' }}
        sx={{
            padding: '8px',
            '&.Mui-selected': {
                backgroundColor: 'var(--colors-gama-50)',
                '&:hover': { backgroundColor: 'var(--colors-gama-50)' },
            },
        }}
        {...props}
    >
        <CheckIcon
            width={24}
            height={24}
            color={props.selected ? 'var(--colors-gama-500)' : 'transparent'}
            style={{ transition: 'color 0.2s ease' }}
        />
        {props.children}
    </MenuItem>
)
