/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'
import tsConfigPaths from 'vite-tsconfig-paths'
import terser from '@rollup/plugin-terser'
import * as packageJson from './package.json'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import reactDocgenTypescript from '@joshwooding/vite-plugin-react-docgen-typescript'

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
    plugins: [
        react({
            jsxRuntime: 'automatic',
        }),
        tsConfigPaths(),
        dts({
            insertTypesEntry: true,
            //rollupTypes: true,
            exclude: ['node_modules/**/*', 'src/stories/**', 'src/**/*.stories.tsx', 'src/components/**/makeData.ts'],
        }),
        reactDocgenTypescript(),
    ],
    build: {
        lib: {
            entry: resolve('src', 'index.ts'),
            name: 'asma-core-ui',
            formats: ['es'],
            fileName: (format) => `asma-core-ui.${format}.js`,
        },
        rollupOptions: {
            external: [...Object.keys(packageJson.peerDependencies), ...Object.keys(packageJson.devDependencies)],
            plugins: [terser],
            // output: {
            //     //globals: {
            //     //    react: 'React',
            //     //    'react/jsx-runtime': 'react/jsx-runtime',
            //     //     'react-dom': 'ReactDOM',
            //     //  },
            //     plugins: [terser()],
            // },
        },
    },
    test: {
        projects: [
            {
                extends: true,
                plugins: [
                    // The plugin will run tests for the stories defined in your Storybook config
                    // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
                    storybookTest({
                        configDir: path.join(dirname, '.storybook'),
                    }),
                ],
                test: {
                    name: 'storybook',
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright({}),
                        instances: [
                            {
                                browser: 'chromium',
                            },
                        ],
                    },
                    setupFiles: ['.storybook/vitest.setup.ts'],
                },
            },
        ],
    },
})
