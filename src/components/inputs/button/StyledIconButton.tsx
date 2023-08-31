import { IconButton, type IconButtonProps } from '@mui/material'

interface StyledIconButtonProps extends IconButtonProps {
    variant?: 'mui' | 'core-ui'
}

export const StyledIconButton = (props: StyledIconButtonProps) => {
    const { variant } = props

    const rootClassName =
        variant === 'core-ui'
            ? 'p-1 rounded text-delta-800 hover:bg-primary-50 active:bg-primary-100 focus:border-2 focus:border-solid focus:border-warning-500 disabled:text-delta-300'
            : props.classes?.root
    const disableRipple = variant === 'core-ui' ? true : props.disableRipple

    return (
        <IconButton
            {...props}
            classes={{
                root: rootClassName,
                ...props.classes,
            }}
            disableRipple={disableRipple}
        >
            {props.children}
        </IconButton>
    )
}
