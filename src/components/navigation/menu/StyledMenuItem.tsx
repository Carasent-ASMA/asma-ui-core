import { MenuItem, type MenuItemProps } from '@mui/material'
import clsx from 'clsx'

export const StyledMenuItem = (props: MenuItemProps) => (
    <MenuItem
        {...props}
        classes={{
            root: clsx('px-3 py-2.5', props.classes?.root),
            ...props.classes,
        }}
    />
)
