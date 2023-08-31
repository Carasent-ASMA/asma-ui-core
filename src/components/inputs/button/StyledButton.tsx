import { Button, type ButtonProps } from '@mui/material'

/**
 * Custom props:
 *
 * @reflink
 * use reflink to provide ref attribute on wrapper component.
 *
 */
export const StyledButton = (
    props: ButtonProps & {
        reflink?: React.RefObject<HTMLButtonElement> | null | undefined
    },
) => (
    <Button
        variant={props.variant || 'contained'}
        {...props}
        ref={props.reflink}
        disableRipple
        classes={{
            containedPrimary: 'normal-case bg-primary-main hover:bg-primary-700 active:bg-primary-dark',
            containedSecondary: 'normal-case bg-secondary-main hover:bg-secondary-700 active:bg-secondary-dark',
            disabled: 'bg-gray-200 text-gray-400 border-grey-500',
            outlined: `normal-case text-primary-dark ${
                !props.disabled && 'border-primary-main'
            } hover:bg-primary-500 hover:text-gray-50 hover:border-primary-500`,
            focusVisible: `${props.variant === 'contained' && 'bg-primary-700 shadow-[0_0_0_3px] shadow-primary-400'} ${
                props.variant === 'outlined' && 'bg-primary-100 text-primary-dark'
            }}`,
            text: 'normal-case',
        }}
    />
)
