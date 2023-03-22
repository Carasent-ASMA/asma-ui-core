import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import tsConfigPaths from 'vite-tsconfig-paths'
import * as packageJson from './package.json'
import rollupTs from 'rollup-plugin-typescript2'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react({
            jsxRuntime: 'automatic',
        }),
        tsConfigPaths(),
        // dts({
        //     insertTypesEntry: true,
        //     include: 'src',
        //     skipDiagnostics: false,
        // }),
        dts({ insertTypesEntry: true }),
        // only for type checking
        {
            ...rollupTs({
                check: true,
                tsconfig: './tsconfig.json',
                tsconfigOverride: {
                    noEmits: true,
                },
            }),
            // run before build
            enforce: 'pre',
        },
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
                    'react-dom': 'ReactDOM',
                },
            },
        },
    },
})
