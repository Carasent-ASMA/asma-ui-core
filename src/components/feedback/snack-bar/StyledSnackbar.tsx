import { Snackbar, type SnackbarProps } from '@mui/material'

export const StyledSnackbar = ({ children, ...props }: SnackbarProps) => (
    <Snackbar autoHideDuration={props.autoHideDuration ?? 3000} {...props}>
        {children && <div>{children}</div>}
    </Snackbar>
)
