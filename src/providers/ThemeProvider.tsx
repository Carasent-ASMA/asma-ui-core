import { ThemeProvider as _ThemeProvider } from '@mui/material/styles'
import { SnackbarProvider } from 'notistack'
import { omit, pick } from 'lodash-es'
import type { IThemeProvider } from '../interfaces'

export const ThemeProvider = (props: IThemeProvider) => {
    const _ThemeProviderProps = omit(props, ['SnackbarProviderProps'])
    const _SnackbarProviderProps = pick(props, ['SnackbarProviderProps'])

    return (
        <_ThemeProvider {..._ThemeProviderProps}>
            <SnackbarProvider {..._SnackbarProviderProps.SnackbarProviderProps}>{props.children}</SnackbarProvider>
        </_ThemeProvider>
    )
}
