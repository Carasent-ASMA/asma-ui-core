import { Snackbar, type SnackbarProps } from '@mui/material'

export const StyledSnackbar = ({ children, dataTest, ...props }: SnackbarProps & { dataTest?: string }) => (
    <Snackbar data-test={dataTest} autoHideDuration={props.autoHideDuration ?? 300000} {...props}>
        {children && <div>{children}</div>}
    </Snackbar>
)
