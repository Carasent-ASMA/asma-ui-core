import type { AlertColor } from '@mui/material'
import type { SnackbarProviderProps } from 'notistack'

export type MessageProps = SnackbarProviderProps & {
    severity?: AlertColor
    persist?: boolean
    closeButton?: boolean
    className?: string
    id?: string
    type?: 'loading'
}
