import { readdirSync } from 'node:fs'
import { dirname, posix, resolve } from 'node:path'
import react from '@vitejs/plugin-react'
/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts'
import * as packageJson from './package.json'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

type AssetEmitterContext = {
    emitFile: (file: { type: 'asset'; fileName: string; source: string }) => void
}

const externalPackages = new Set([
    ...Object.keys(packageJson.peerDependencies ?? {}),
    'notistack',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
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

    return `export * from "${
        relativeMainBundlePath.startsWith('.') ? relativeMainBundlePath : `./${relativeMainBundlePath}`
    }";\n`
}

const emitIconCompatibilityAssets = () => ({
    name: 'emit-icon-compatibility-assets',
    generateBundle(this: AssetEmitterContext) {
        this.emitFile({
            type: 'asset',
            fileName: 'style.css',
            source: '@import "./asma-ui-core.css";\n',
        })

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

const currentDirectory = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

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
        alias: {
            src: path.resolve(currentDirectory, 'src'),
            'asma-ui-core': path.resolve(currentDirectory, 'src', 'index.ts'),
        },
    },
    build: {
        minify: 'esbuild',
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
                globals: {
                    react: 'React',
                    'react/jsx-runtime': 'react/jsx-runtime',
                    'react/jsx-dev-runtime': 'react/jsx-dev-runtime',
                    'react-dom': 'ReactDOM',
                },
            },
        },
    },
    test: {
        projects: [
            {
                extends: true,
                plugins: [
                    storybookTest({
                        configDir: path.join(currentDirectory, '.storybook'),
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
