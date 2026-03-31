import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: [
        '@storybook/addon-a11y',
        '@storybook/addon-links',
        'storybook/manager-api',
        '@storybook/addon-docs',
        '@storybook/addon-themes',
        '@storybook/addon-vitest',
        '@chromatic-com/storybook',
        'storybook-addon-pseudo-states',
    ],
    framework: {
        name: '@storybook/react-vite',
        options: {
            builder: {
                viteConfigPath: './vite.config.ts',
            },
        },
    },
    docs: {},
    core: { disableTelemetry: true },
    typescript: {
        reactDocgen: 'react-docgen-typescript',
        reactDocgenTypescriptOptions: {
            shouldExtractLiteralValuesFromEnum: true,
            shouldRemoveUndefinedFromOptional: true,
            savePropValueAsString: true,
            propFilter: (prop) => (prop.parent ? !/node_modules\/(?!@mui)/.test(prop.parent.fileName) : true),
            compilerOptions: {
                allowSyntheticDefaultImports: false,
            },
        },
    },
}
export default config
