import { Menu, type MenuProps } from '@mui/material'
import clsx from 'clsx'

export const StyledMenu = (props: MenuProps) => (
    <Menu
        {...props}
        classes={{
            paper: clsx(
                'border border-solid border-delta-300 shadow-[0px_2px_4px_0px_rgba(34,_33,_51,_0.15)]',
                props.classes?.paper,
            ),
            list: clsx('py-1', props.classes?.list),
            ...props.classes,
        }}
    />
)
