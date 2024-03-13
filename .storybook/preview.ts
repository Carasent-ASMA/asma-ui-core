import { useEffect, useGlobals } from '@storybook/addons'
import { withThemeByClassName } from '@storybook/addon-styling'
import 'tailwindcss/tailwind.css'
import './normalize.css'
import '../src/styles/index.css'

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

export const decorators = [
    useTheme,
    withThemeByClassName({
        themes: {
            default: 'default',
            fretex: 'fretex',
            greenish: 'greenish',
        },
        defaultTheme: 'greenish',
    }),
]
