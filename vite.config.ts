import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'
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
        dts({
            insertTypesEntry: true,
            include: 'src',
        }),
    ],
    build: {
        lib: {
            entry: resolve('src', 'index.ts'),
            name: 'asma-antrd',
            formats: ['es'],
            fileName: (format) => `asma-antrd.${format}.js`,
        },
        rollupOptions: {
            external: [...Object.keys(packageJson.peerDependencies)],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
            },
        },
    },
})
