import { Snackbar, type SnackbarProps, styled } from '@mui/material'

export const StyledSnackbar = styled(({ children, ...props }: SnackbarProps) => (
    <Snackbar autoHideDuration={props.autoHideDuration ?? 6000} {...props}>
        {children && <div>{children}</div>}
    </Snackbar>
))``
