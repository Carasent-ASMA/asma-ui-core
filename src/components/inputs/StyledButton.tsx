import { Button, type ButtonProps } from '@mui/material'
import { styled } from '@mui/material/styles'

// export const StyledButton = styled((props: ButtonProps) => <Button {...props} disableRipple />)`
//     text-transform: none;
//     &.MuiButton-containedPrimary {
//         background-color: ${({ theme }) => theme.palette.primary[500]};
//     }
//     &.MuiButton-containedPrimary:disabled {
//         color: ${grey[50]};
//         background-color: ${grey[500]};
//     }
//     &.MuiButton-containedPrimary:hover {
//         background-color: ${(props) => props.theme.palette.primary[700]};
//     }
//     &.MuiButton-containedPrimary:active {
//         background-color: ${(props) => props.theme.palette.primary.dark};
//     }
//     &.Mui-focusVisible {
//         box-shadow: ${(props) => props.variant === 'contained' && `0 0 0 3px ${props.theme.palette.primary[400]}`};
//         background-color: ${(props) => props.variant === 'contained' && props.theme.palette.primary[700]};
//         background-color: ${(props) => props.variant === 'outlined' && props.theme.palette.primary[100]};
//         color: ${(props) => props.variant === 'outlined' && grey[900]};
//     }
// `

export const StyledButton = styled((props: ButtonProps) => (
    <Button
        variant={props.variant || 'contained'}
        {...props}
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
))``
