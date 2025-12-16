import { Snackbar, type SnackbarProps } from '@mui/material'

export const StyledSnackbar = ({ children, ...props }: SnackbarProps): JSX.Element => (
    <Snackbar autoHideDuration={props.autoHideDuration ?? 3000} {...props}>
        {children && <div>{children}</div>}
    </Snackbar>
)
