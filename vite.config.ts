/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'
import * as packageJson from './package.json'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
    plugins: [
        react({
            jsxRuntime: 'automatic',
        }),
        dts({
            insertTypesEntry: true,
            //rollupTypes: true,
            exclude: ['node_modules/**/*', 'src/stories/**', 'src/**/*.stories.tsx', 'src/components/**/makeData.ts'],
        }),
    ],
    resolve: {
        tsconfigPaths: true,
    },
    build: {
        lib: {
            entry: resolve('src', 'index.ts'),
            name: 'asma-ui-core',
            formats: ['es'],
            fileName: (format) => `asma-ui-core.${format}.js`,
        },
        rolldownOptions: {
            external: [...Object.keys(packageJson.peerDependencies), ...Object.keys(packageJson.devDependencies)],
            output: { minify: true },
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
                },
            },
        ],
    },
})
