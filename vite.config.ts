import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import tsConfigPaths from 'vite-tsconfig-paths'
import terser from '@rollup/plugin-terser'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import * as packageJson from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react({
            jsxRuntime: 'automatic',
        }),
        tsConfigPaths(),
        dts({
            insertTypesEntry: true,
            exclude: ['node_modules/**/*', 'src/stories/**', 'src/**/*.stories.tsx', 'src/components/**/makeData.ts'],
        }),
        cssInjectedByJsPlugin(),
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
            output: {
                globals: {
                    react: 'React',
                    'react/jsx-runtime': 'react/jsx-runtime',
                    'react-dom': 'ReactDOM',
                },
                plugins: [terser()],
            },
        },
    },
})
