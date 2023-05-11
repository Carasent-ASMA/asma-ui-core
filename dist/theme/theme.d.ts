import type { SimplePaletteColorOptions } from '@mui/material';
declare const theme: {
    palette: {
        primary: {
            "50": string;
            "100": string;
            "200": string;
            "300": string;
            "400": string;
            "500": string;
            "600": string;
            "700": string;
            "800": string;
            "900": string;
            light: string;
            main: string;
            dark: string;
            contrastText: string;
        };
    };
    typography: {
        fontFamily: string;
        fontSize: number;
        h1: {
            fontSize: string;
            fontWeight: number;
            marginBottom: string;
        };
        h2: {
            fontSize: string;
            fontWeight: number;
            marginBottom: string;
        };
        h3: {
            fontSize: string;
            fontWeight: number;
            marginBottom: string;
        };
        subtitle1: {
            fontSize: string;
            fontWeight: string;
        };
        subtitle2: {
            fontSize: string;
            fontWeight: number;
        };
        body1: {
            fontSize: string;
            fontWeight: string;
        };
        body2: {
            fontSize: string;
            fontWeight: string;
        };
        button: {
            fontSize: string;
            fontWeight: number;
        };
        caption: {
            fontSize: string;
            fontWeight: string;
        };
        overline: {
            fontSize: string;
            fontWeight: string;
        };
    };
};
export default theme;
declare module '@mui/material/styles' {
    interface Theme {
        palette: {
            primary: {
                50: string;
                100: string;
                200: string;
                300: string;
                400: string;
                500: string;
                600: string;
                700: string;
                800: string;
                900: string;
                light: string;
                main: string;
                dark: string;
            };
            success: SimplePaletteColorOptions;
            warning: SimplePaletteColorOptions;
            error: SimplePaletteColorOptions;
        };
    }
}
