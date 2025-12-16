import 'tailwindcss/tailwind.css'
import './normalize.css'
import '../src/styles/index.css'
import type { Preview, ReactRenderer } from '@storybook/react-vite'
import { withThemeByDataAttribute } from '@storybook/addon-themes'

import { INITIAL_VIEWPORTS } from 'storybook/viewport'

const preview: Preview = {
    decorators: [
        withThemeByDataAttribute<ReactRenderer>({
            themes: {
                default: 'default',
                fretex: 'fretex',
                greenish: 'greenish',
            },
            defaultTheme: 'default',
            attributeName: 'data-theme',
        }),
    ],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
        viewport: {
            options: INITIAL_VIEWPORTS,
        },
    },
    tags: ['autodocs'],
}

export default preview
