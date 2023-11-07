import { Menu, type MenuProps } from '@mui/material'
import clsx from 'clsx'

export const StyledMenu = ({dataTest, ...props}: MenuProps & { dataTest?: string }) => (
    <Menu
        {...props}
        data-test={dataTest}
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
