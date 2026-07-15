import { MenuItem, type MenuItemProps } from '@mui/material'
import clsx from 'clsx'

export const StyledMenuItem = (props: MenuItemProps): JSX.Element => (
    <MenuItem
        {...props}
        classes={{
            selected: 'bg-gama-50',
            root: clsx('h-10 pl-4 pr-2 hover:bg-delta-50', props.classes?.root),
            ...props.classes,
        }}
        sx={{
            fontSize: 'var(--font-size-body-base)',
            '&.Mui-disabled': {
                pointerEvents: 'auto',
                cursor: 'not-allowed',
                '&:hover': {
                    backgroundColor: 'transparent !important',
                },
            },
            ...props.sx,
        }}
    />
)
