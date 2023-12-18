import type { AlertColor } from '@mui/material'
import { SnackbarProvider as NotistackProvider, type SnackbarProviderProps } from 'notistack'
import { StyledAlertSnackbar } from 'src/components/feedback/snack-bar/StyledAlertSnackbar'
import { StyledInfoSnackbar } from './components/StyledInfoSnackbar'

/**
 * @ignore
 * @internal
 */
export const SnackbarProvider = (props: SnackbarProviderProps) => {
    return (
        <NotistackProvider
            {...props}
            Components={{
                alert: StyledAlertSnackbar,
                info: StyledInfoSnackbar,
            }}
            autoHideDuration={6000}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            domRoot={document.body}
            maxSnack={3}
            classes={{ root: 'min-w-fit' }}
            className='w-fit min-w-fit max-w-fit '
        >
            {props.children}
        </NotistackProvider>
    )
}

declare module 'notistack' {
    interface VariantOverrides {
        alert: {
            /**
             * The className to apply to the alert.
             */
            alertClassName?: string
            /**
             * The variant to use.
             * @default 'standard'
             */
            alertVariant?: 'standard' | 'filled' | 'outlined'
            /**
             * The severity of the alert. This defines the color and icon used.
             * @default 'success'
             */
            severity?: AlertColor
            /**
             * If true, the alert is closable.
             * @default false
             */
            closeButton?: boolean
        }
    }
}
