import type { ThemeProviderProps } from '@mui/material/styles/ThemeProvider'
import type { SnackbarProviderProps } from 'notistack'

export interface IThemeProvider extends ThemeProviderProps {
    SnackbarProviderProps?: SnackbarProviderProps
}
