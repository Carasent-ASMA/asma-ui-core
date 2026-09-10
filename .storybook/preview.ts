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
            //
            // Enforced fleet-wide (ASMA-8136): any story with an axe violation fails the build.
            // Stories that were already failing when enforcement landed carry a per-story
            // `parameters.a11y.test = 'todo'` override with a comment naming the violation.
            // That allowlist is documented in docs/a11y-allowlist.md and is meant to be burned
            // down - do not add new entries to it, fix the story instead.
            test: 'error',
        },
    },
    tags: ['autodocs'],
}

export default preview
