import { MenuItem, type MenuItemProps } from '@mui/material'
import clsx from 'clsx'

export const StyledMenuItem = (props: MenuItemProps) => (
    <MenuItem
        {...props}
        classes={{
            selected: 'bg-gama-50',
            root: clsx('px-3 py-2.5 not-selected-hover:bg-delta-50', props.classes?.root),
            ...props.classes,
        }}
    />
)
