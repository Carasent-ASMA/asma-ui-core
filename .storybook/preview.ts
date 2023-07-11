import { useEffect, useGlobals } from '@storybook/addons'
import { withThemeFromJSXProvider } from '@storybook/addon-styling'
import defaultTheme from '../src/theme/theme'
import customColors from '../src/theme/customMuiColors'
import { createTheme, ThemeProvider } from '../src/providers'
import { CssBaseline } from '@mui/material'
import 'tailwindcss/tailwind.css'
import '../src/styles/index.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '@fontsource/material-icons'

export const parameters = {
    // themes: {
    //     default: 'default',
    //     list: [
    //         { name: 'default', class: 'theme-default', color: 'blue' },
    //         { name: 'fretex', class: 'theme-fretex', color: 'red' },
    //         { name: 'greenish', class: 'theme-greenish', color: 'green' },
    //     ],
    // },
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
        expanded: true, // Adds the description and default columns
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
}

export const useTheme = (StoryFn) => {
    const [globals] = useGlobals()

    useEffect(() => {
        document.body.setAttribute('data-theme', globals.theme)
    }, [globals])

    return StoryFn()
}

const theme = createTheme(defaultTheme)
const fretex = createTheme(defaultTheme, {
    palette: {
        primary: {
            ...customColors.fretex.primary,
        },
    },
})
const greenish = createTheme(defaultTheme, {
    palette: {
        primary: {
            ...customColors.greenish.primary,
        },
    },
})

export const decorators = [
    useTheme,
    withThemeFromJSXProvider({
        themes: {
            default: theme,
            fretex,
            greenish,
        },
        defaultTheme: 'default',
        Provider: ThemeProvider,
        GlobalStyles: CssBaseline,
    }),
]
