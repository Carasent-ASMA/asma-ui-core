import '../src/styles/index.scss'
import './css/variables.css'
import './css/fretex-variables.css'
import { useEffect, useGlobals } from '@storybook/addons'

export const useTheme = (StoryFn) => {
    const [{ theme }] = useGlobals()

    useEffect(() => {
        document.body.setAttribute('data-theme', theme)
    }, [theme])

    return StoryFn()
}

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
}

export const globalTypes = {
    theme: {
        innerWidth: 500,
        outerWidth: 500,
        name: 'Toggle theme',
        description: 'Global theme for components',
        defaultValue: 'default',
        toolbar: {
            icon: 'globe',
            items: ['default', 'fretex', 'adcuris'],
            // dynamicTitle: true,
        },
    },
}

export const decorators = [useTheme]
