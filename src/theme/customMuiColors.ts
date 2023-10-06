import { greenishTokens } from '../styles/greenish-tokens/index'
import { fretexTokens } from '../styles/fretex-tokens/index'
import './../styles/index.css'

const customPalettes = {
    greenish: {
        primary: greenishTokens().primary,
    },
    fretex: {
        primary: fretexTokens().primary,
        secondary: {
            100: '#EFF4F2',
            200: '#DEEBE5',
            300: '#C6D7D0',
            400: '#ADC6BC',
            500: '#9CB2A9',
            600: '#798B84',
            700: '#667670',
            800: '#454F4B',
        },
    },
    role: {
        patient: {
            light: '#DEE8E4',
            main: '#ff0000',
            dark: '#454F4B',
        },
        network: {
            light: '#DEE8E4',
            main: '#ff0000',
            dark: '#454F4B',
        },
    },
}

export default customPalettes
