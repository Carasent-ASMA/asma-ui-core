import { ThemeProvider as _ThemeProvider } from '@mui/material/styles'
import type { IThemeProvider } from '../interfaces'
import { omit, pick } from 'src/helpers'
import { SnackbarProvider } from './SnackbarProvider'

export const ThemeProvider = (props: IThemeProvider) => {
    const _ThemeProviderProps = omit(props, ['SnackbarProviderProps'])
    const _SnackbarProviderProps = pick(props, ['SnackbarProviderProps'])

    return (
        <_ThemeProvider {..._ThemeProviderProps}>
            <SnackbarProvider {..._SnackbarProviderProps.SnackbarProviderProps}>{props.children}</SnackbarProvider>
        </_ThemeProvider>
    )
}
