import { Snackbar, type SnackbarProps } from '@mui/material'

export const StyledSnackbar = ({ children, ...props }: SnackbarProps) => (
    <Snackbar autoHideDuration={props.autoHideDuration ?? 6000} {...props}>
        {children && <div>{children}</div>}
    </Snackbar>
)
