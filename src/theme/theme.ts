import type { SimplePaletteColorOptions } from '@mui/material'
import './../styles/index.css'
import { tokens } from '../styles/tokens'

const theme = {
    palette: {
        primary: tokens().primary,
        // error: {
        //     main: 'rgb(176, 0, 32)', // = '#b00020',
        //     light: '#ffaaaa',
        // },
        // success: {
        //     light: '#CBFFD9',
        //     main: '#EFCC1D',
        //     dark: '#388e3c',
        // },
        // warning: {
        //     light: '#FFF9C4',
        //     main: '#ffeb3b',
        //     dark: '#fbc02d',
        // },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: 16,
        h1: {
            fontSize: 'var(--text-h1)',
            fontWeight: 600,
            marginBottom: '1rem',
        },
        h2: {
            fontSize: 'var(--text-h2)',
            fontWeight: 600,
            marginBottom: '1rem',
        },
        h3: {
            fontSize: '1rem',
            fontWeight: 600,
            marginBottom: '1rem',
        },
        subtitle1: {
            fontSize: '1rem',
            fontWeight: 'normal',
        },
        subtitle2: {
            fontSize: '1rem',
            fontWeight: 500,
        },
        body1: {
            fontSize: 'var(--text-base)',
            fontWeight: 'normal',
        },
        body2: {
            fontSize: 'var(--text-small)',
            fontWeight: 'normal',
        },
        button: {
            fontSize: '0.875rem',
            fontWeight: 500,
        },
        caption: {
            fontSize: '0.625rem',
            fontWeight: 'normal',
        },
        overline: {
            fontSize: '0.625rem',
            fontWeight: 'normal',
        },
    },
}

export default theme

declare module '@mui/material/styles' {
    interface Theme {
        palette: {
            primary: {
                50: string
                100: string
                200: string
                300: string
                400: string
                500: string
                600: string
                700: string
                800: string
                900: string
                light: string
                main: string
                dark: string
            }
            success: SimplePaletteColorOptions
            warning: SimplePaletteColorOptions
            error: SimplePaletteColorOptions
        }
    }
}
