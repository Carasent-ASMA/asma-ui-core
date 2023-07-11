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
        check: true,
        reactDocgen: 'react-docgen-typescript',
        reactDocgenTypescriptOptions: {
            shouldExtractLiteralValuesFromEnum: true,
            savePropValueAsString: true,
            propFilter: (prop) =>
                prop.parent
                    ? /@material-ui/.test(prop.parent.fileName) || !/node_modules/.test(prop.parent.fileName)
                    : true,
            compilerOptions: {
                allowSyntheticDefaultImports: false,
            },
        },
    },
}
export default config
