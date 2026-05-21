import { readdirSync } from 'node:fs'
import { dirname, posix, relative, resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import tsConfigPaths from 'vite-tsconfig-paths'
import terser from '@rollup/plugin-terser'
import * as packageJson from './package.json'

type AssetEmitterContext = {
    emitFile: (file: { type: 'asset'; fileName: string; source: string }) => void
}

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

const iconsSourceDirectory = resolve('src', 'components', 'icons')

const collectIconDirectoryNames = (directory: string): string[] => {
    return readdirSync(directory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .filter((entryName) => readdirSync(resolve(directory, entryName)).includes('index.ts'))
        .sort()
}

const createCompatibilityWrapper = (fromFileName: string): string => {
    const relativeMainBundlePath = posix.relative(dirname(fromFileName), 'asma-ui-core.es.js')

    return `export * from "${relativeMainBundlePath.startsWith('.') ? relativeMainBundlePath : `./${relativeMainBundlePath}`}";\n`
}

const emitIconCompatibilityAssets = () => ({
    name: 'emit-icon-compatibility-assets',
    generateBundle(this: AssetEmitterContext) {
        this.emitFile({
            type: 'asset',
            fileName: 'icons/index.js',
            source: createCompatibilityWrapper('icons/index.js'),
        })

        for (const iconDirectoryName of collectIconDirectoryNames(iconsSourceDirectory)) {
            const fileName = `icons/${iconDirectoryName}/index.js`

            this.emitFile({
                type: 'asset',
                fileName,
                source: createCompatibilityWrapper(fileName),
            })
        }
    },
})

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
            plugins: [emitIconCompatibilityAssets()],
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
