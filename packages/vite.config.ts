import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'
// import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import dts from 'vite-plugin-dts'
import tsConfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig(() => ({
    plugins: [
        react({
            jsxRuntime: 'automatic',
        }),
        tsConfigPaths(),
        dts({
            insertTypesEntry: true,
            include: resolve(__dirname, 'src'),
        }),
        // cssInjectedByJsPlugin({ topExecutionPriority: false, styleId: 'antrd' }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    build: {
        sourcemap: true,
        manifest: true,
        minify: false,
        lib: {
            entry: [
                resolve(__dirname, 'src/index.ts'),
                resolve(__dirname, 'src/rd-components/badges/rd-badge/RdBadge.tsx'),
                resolve(__dirname, 'src/rd-components/rd-button/RdButton.tsx'),
                resolve(__dirname, 'src/rd-components/modals/modal-confirm/AtrdModalConfirm.tsx'),
                resolve(__dirname, 'src/cardea-components/cardea-spinner/CardeaSpinner.tsx'),
                resolve(__dirname, 'src/cardea-components/cardea-select/CardeaSelect.tsx'),
            ],
            name: 'asma-antrd',
            formats: ['es'],
            // formats: ['es', 'umd'],
            fileName: (format, entry) => {
                if (entry.includes('index')) {
                    return `asma-antrd.${format}.js`
                }
                return `${entry}.${format}.js`
            },
        },
        rollupOptions: {
            external: ['react', 'react-dom'],
            output: {
                // format: 'es',
                // dir: 'dist',
                // preserveModules: true,
                // preserveModulesRoot: 'src',
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
            },
        },
    },
}))
