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
            expanded: true,
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },

        viewport: {
            options: INITIAL_VIEWPORTS,
        },

        a11y: {
            // 'todo' - show a11y violations in the test UI only
            // 'error' - fail CI on a11y violations
            // 'off' - skip a11y checks entirely
            test: 'todo',
        },
    },
    tags: ['autodocs'],
}

export default preview
