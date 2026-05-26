import type { AlertColor } from '@mui/material'
import { SnackbarProvider as NotistackProvider, type SnackbarMessage, type SnackbarProviderProps } from 'notistack'

import { StyledAlertSnackbar } from './StyledAlertSnackbar'
import { StyledDefaultSnackbar } from './components/StyledDefaultSnackbar'
import { StyledInfoSnackbar } from './components/StyledInfoSnackbar'

export const SnackbarProvider = (props: SnackbarProviderProps): JSX.Element => {
    return (
        <NotistackProvider
            {...props}
            Components={{
                alert: StyledAlertSnackbar,
                info: StyledInfoSnackbar,
                default: StyledDefaultSnackbar,
            }}
            autoHideDuration={6000}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            domRoot={document.body}
            maxSnack={3}
            classes={{ root: 'min-w-fit flex justify-center' }}
            className='w-fit min-w-fit max-w-fit'
        >
            {props.children}
        </NotistackProvider>
    )
}

declare module 'notistack' {
    interface VariantOverrides {
        default: {
            severity: AlertColor
            title?: SnackbarMessage
        }
        alert: {
            alertClassName?: string
            alertVariant?: 'standard' | 'filled' | 'outlined'
            severity?: AlertColor
            closeButton?: boolean
        }
        info: {
            closeButton?: boolean
            type?: 'loading'
        }
    }
}
