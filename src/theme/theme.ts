import type { SimplePaletteColorOptions } from '@mui/material'
import { teal } from '@mui/material/colors'
// Required for the create-index automation to work
import './../styles/index.scss'

const theme = {
    palette: {
        primary: {
            50: teal[50],
            100: teal[100],
            200: teal[200],
            300: teal[300],
            400: teal[400],
            500: teal[500],
            600: teal[600],
            700: teal[700],
            800: teal[800],
            900: teal[900],
            light: teal[50],
            main: teal[600],
            dark: teal[900],
            contrastText: '#fff',
        },
        // primaryPalette: {
        // },
        error: {
            main: 'rgb(176, 0, 32)', // = '#b00020',
            light: '#ffaaaa',
        },
        success: {
            light: '#CBFFD9',
            main: '#EFCC1D',
            dark: '#388e3c',
        },
        warning: {
            light: '#FFF9C4',
            main: '#ffeb3b',
            dark: '#fbc02d',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: 16,
        h1: {
            fontSize: '2.125rem',
            fontWeight: 'normal',
            marginBottom: '1rem',
        },
        h2: {
            fontSize: '1.5rem',
            fontWeight: 'normal',
            marginBottom: '1rem',
        },
        h3: {
            fontSize: '1.25rem',
            fontWeight: 'normal',
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
            fontSize: '1rem',
            fontWeight: 'normal',
        },
        body2: {
            fontSize: '0.875rem',
            fontWeight: 'normal',
        },
        button: {
            fontSize: '0.875rem',
            fontWeight: 500,
        },
        caption: {
            fontSize: '0.75rem',
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
            // primaryPalette: {
            //     [key: string]: Partial<Color>
            // }[]
            success: SimplePaletteColorOptions
            warning: SimplePaletteColorOptions
            error: SimplePaletteColorOptions
        }
    }
    // interface Palette {
    //     primaryPalette: {
    //         [key: string]: Partial<Color>
    //     }[]
    // }
    // interface PaletteOptions {
    //     primaryPalette: {
    //         [key: string]: Partial<Color>
    //     }[]
    // }
}
