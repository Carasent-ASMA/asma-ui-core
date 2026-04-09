import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import tsConfigPaths from 'vite-tsconfig-paths'
import terser from '@rollup/plugin-terser'
import * as packageJson from './package.json'

const externalPackages = new Set([
    ...Object.keys(packageJson.peerDependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
])

const isExternalPackage = (id: string) => {
    for (const packageName of externalPackages) {
        if (id === packageName || id.startsWith(`${packageName}/`)) {
            return true
        }
    }

    return false
}

// https://vitejs.dev/config/
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
        // cssInjectedByJsPlugin(),
    ],
    build: {
        lib: {
            entry: resolve('src', 'index.ts'),
            name: 'asma-ui-core',
            formats: ['es'],
            fileName: (format) => `asma-ui-core.${format}.js`,
        },
        rollupOptions: {
            external: isExternalPackage,
            output: {
                //globals: {
                //    react: 'React',
                //    'react/jsx-runtime': 'react/jsx-runtime',
                //     'react-dom': 'ReactDOM',
                //  },
                plugins: [terser()],
            },
        },
    },
})
