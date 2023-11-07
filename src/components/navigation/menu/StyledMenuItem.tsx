import { MenuItem, type MenuItemProps } from '@mui/material'
import clsx from 'clsx'

export const StyledMenuItem = ({dataTest, ...props}: MenuItemProps & { dataTest?: string }) => (
    <MenuItem
        {...props}
        data-test={dataTest}
        classes={{
            root: clsx('px-3 py-2.5', props.classes?.root),
            ...props.classes,
        }}
    />
)
