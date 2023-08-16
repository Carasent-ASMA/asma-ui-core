import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import tsConfigPaths from 'vite-tsconfig-paths'
import * as packageJson from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react({
            jsxRuntime: 'automatic',
        }),
        tsConfigPaths(),
        dts({ insertTypesEntry: true }),
    ],
    build: {
        lib: {
            entry: resolve('src', 'index.ts'),
            name: 'asma-core-ui',
            formats: ['es'],
            fileName: (format) => `asma-core-ui.${format}.js`,
        },
        rollupOptions: {
            external: [...Object.keys(packageJson.peerDependencies)],
            output: {
                globals: {
                    react: 'React',
                    'react/jsx-runtime': 'react/jsx-runtime',
                    'react-dom': 'ReactDOM',
                },
            },
        },
    },
})
