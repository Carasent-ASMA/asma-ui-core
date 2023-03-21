// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Button, ButtonProps } from '@mui/material'
import { styled } from '@mui/material/styles'
import grey from '@mui/material/colors/grey'

export const StyledButton = styled((props: ButtonProps) => <Button {...props} disableRipple />)`
    text-transform: none;
    &.MuiButton-containedPrimary {
        background-color: ${({ theme }) => theme.palette.primary.main};
    }
    &.MuiButton-containedPrimary:disabled {
        color: ${grey[50]};
        background-color: ${grey[500]};
    }
    &.MuiButton-containedPrimary:hover {
        background-color: ${(props) => props.theme.palette.primary[700]};
    }
    &.MuiButton-containedPrimary:active {
        background-color: ${(props) => props.theme.palette.primary.dark};
    }
    &.Mui-focusVisible {
        box-shadow: ${(props) => props.variant === 'contained' && `0 0 0 3px ${props.theme.palette.primary[400]}`};
        background-color: ${(props) => props.variant === 'contained' && props.theme.palette.primary[700]};
        background-color: ${(props) => props.variant === 'outlined' && props.theme.palette.primary[100]};
        color: ${(props) => props.variant === 'outlined' && grey[900]};
    }
`

export const TailwindStyledButton = styled((props: ButtonProps) => (
    <Button
        {...props}
        disableRipple
        classes={{
            containedPrimary: 'normal-case bg-primary-main hover:bg-primary-700 active:bg-primary-dark',
            disabled: 'bg-gray-400 text-gray-50',
        }}
    />
))``
