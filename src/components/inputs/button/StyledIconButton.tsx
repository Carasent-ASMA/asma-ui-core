import { IconButton, type IconButtonProps } from '@mui/material'
import clsx from 'clsx'

interface StyledIconButtonProps extends IconButtonProps {
    variant?: 'contained' | 'outlined' | 'text'
}

export const StyledIconButton = (props: StyledIconButtonProps) => {
    const { variant } = props

    let rootClassName = 'rounded focus:outline-2 focus:ring-warning-500 focus:ring-2'
    let errorClassName = ''

    switch (variant) {
        case 'contained':
            rootClassName = clsx(
                rootClassName,
                'bg-primary-main text-white hover:bg-primary-600 active:bg-primary-700 disabled:bg-delta-300',
            )
            errorClassName = 'bg-error-500 hover:!bg-error-600 active:!bg-error-700'
            break
        case 'outlined':
            rootClassName = clsx(
                rootClassName,
                'ring-1 ring-delta-500 text-delta-700 hover:bg-primary-50 hover:ring-delta-700 hover:text-delta-800 active:bg-primary-100 disabled:ring-delta-300 disabled:text-delta-300',
            )
            errorClassName =
                'ring-error-500 text-error-500 hover:!bg-error-100 hover:!ring-error-600 hover:!text-error-600 active:!bg-error-300 active:!ring-error-700 active:!text-error-700'
            break
        case 'text':
            rootClassName = clsx(
                rootClassName,
                'text-primary-500 hover:bg-primary-50 hover:text-delta-800 active:bg-primary-100 disabled:text-delta-300',
            )
            errorClassName = '!text-error-500 hover:!bg-error-100 hover:!text-error-600 active:!bg-error-300'
            break
        default:
            break
    }

    return (
        <IconButton
            disableRipple
            {...props}
            classes={{
                root: rootClassName,
                colorError: errorClassName,
                sizeSmall: 'px-1.5 py-1',
                ...props.classes,
            }}
        >
            {props.children}
        </IconButton>
    )
}
