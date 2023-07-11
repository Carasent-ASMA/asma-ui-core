import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
        '@storybook/addon-styling',
        '@storybook/addons',
        '@storybook/manager-api',
        'storybook-addon-themes',
        '@storybook/addon-mdx-gfm',
        '@storybook/preset-create-react-app',
    ],
    framework: {
        name: '@storybook/react-vite',
        options: {
            builder: {
                viteConfigPath: './vite.config.ts',
            },
        },
    },
    docs: {
        autodocs: 'tag',
    },
    core: {
        builder: '@storybook/builder-vite',
    },
    typescript: {
        check: false,
        reactDocgen: 'react-docgen-typescript',
        reactDocgenTypescriptOptions: {
            // makes union prop types like variant and size appear as select controls
            shouldExtractLiteralValuesFromEnum: true,
            // makes string and boolean types that can be undefined appear as inputs and switches
            shouldRemoveUndefinedFromOptional: true,
            // Filter out third-party props from node_modules except @mui packages
            propFilter: (prop) => (prop.parent ? !/node_modules\/(?!@mui)/.test(prop.parent.fileName) : true),
        },
    },
}
export default config
