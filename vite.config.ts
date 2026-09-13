import { readFileSync, readdirSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import react from '@vitejs/plugin-react'
/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts'
import * as packageJson from './package.json'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

interface AssetEmitterContext {
    emitFile: (file: { type: 'asset'; fileName: string; source: string }) => void
}

const externalPackages = new Set([
    ...Object.keys(packageJson.peerDependencies ?? {}),
    ...Object.keys(packageJson.dependencies ?? {}),
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

const createJavascriptWrapperSource = (indexFilePath: string): string => {
    const source = readFileSync(indexFilePath, 'utf8')

    return source.replace(/from\s+(['"])(\.\/[^'"]+)\1/g, 'from $1$2.js$1')
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
            fileName: 'components/icons/index.js',
            source: createJavascriptWrapperSource(resolve(iconsSourceDirectory, 'index.ts')),
        })

        for (const iconDirectoryName of collectIconDirectoryNames(iconsSourceDirectory)) {
            const iconIndexFilePath = resolve(iconsSourceDirectory, iconDirectoryName, 'index.ts')

            this.emitFile({
                type: 'asset',
                fileName: relative(resolve('src'), iconIndexFilePath).replace(/\.ts$/, '.js'),
                source: createJavascriptWrapperSource(iconIndexFilePath),
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
            exclude: [
                'node_modules/**/*',
                'src/stories/**',
                'src/datetime/stories/**',
                'src/table/stories/**',
                'src/components/icons/stories/**',
                'src/**/*.stories.tsx',
                'src/components/**/makeData.ts',
                // ASMA-8139: keep the keyboard/focus contract suite and its harness out of the
                // published types. Without this the tarball grows by a `.d.ts` per test file, which
                // works against ASMA-8135's tarball reduction. Scoped to the files this ticket adds
                // — the 13 pre-existing `*.test.d.ts` already in dist/ are a separate, older leak
                // and are deliberately left alone rather than fixed in a test-only PR.
                'src/**/*.interaction.test.tsx',
                'src/test-utils/**',
            ],
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
                entryFileNames: '[name].js',
                globals: {
                    react: 'React',
                    'react/jsx-runtime': 'react/jsx-runtime',
                    'react/jsx-dev-runtime': 'react/jsx-dev-runtime',
                    'react-dom': 'ReactDOM',
                },
                preserveModules: true,
                preserveModulesRoot: 'src',
            },
        },
    },
    test: {
        projects: [
            {
                extends: true,
                test: {
                    name: 'unit',
                    environment: 'node',
                    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
                    // ASMA-8139: the keyboard/focus contract suite is real-browser only (focus traps,
                    // roving tabindex and Tab order are exactly what a Node/jsdom env fakes worst). It
                    // matches the `*.test.tsx` include above, so keep it out of this project explicitly
                    // — it runs in the 'interaction' project below.
                    exclude: ['src/**/*.interaction.test.tsx'],
                },
            },
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
            {
                // ASMA-8139 keyboard & focus contract tests (WCAG 2.1.1, 2.1.2, 2.4.3, 2.4.7, 4.1.2,
                // 4.1.3). Same real Chromium as the storybook project, but it holds no stories: adding
                // stories would demand new VRT baselines (visual-tests/stories.spec.ts screenshots every
                // index.json entry) and, once ASMA-8136 lands, axe enforcement on every story it touches.
                // Components are mounted directly instead — see src/test-utils/renderInteraction.tsx.
                extends: true,
                // Every runtime dependency is pre-declared, not discovered lazily. Vitest's
                // browser-mode dep optimizer bundles what it finds in its first scan; a React-using
                // dependency imported later (react-day-picker, notistack, …) triggers a SECOND
                // optimize pass with a fresh `?v=` hash, and the module graph then holds two copies of
                // React — the renderer keeps one dispatcher while the newly bundled component reads
                // the other, which is null. That surfaces as "Cannot read properties of null (reading
                // 'useState'/'useId')" from whichever component happened to load late, i.e. an error
                // that points at the wrong file entirely. Listing them up front keeps it to one pass.
                resolve: { dedupe: ['react', 'react-dom'] },
                optimizeDeps: {
                    include: [
                        'react',
                        'react/jsx-runtime',
                        'react/jsx-dev-runtime',
                        'react-dom',
                        'react-dom/client',
                        ...Object.keys(packageJson.dependencies ?? {}),
                    ],
                },
                test: {
                    name: 'interaction',
                    include: ['src/**/*.interaction.test.tsx'],
                    setupFiles: [path.join(currentDirectory, 'src', 'test-utils', 'interaction.setup.ts')],
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright({}),
                        // Desktop by default, and matching the VRT viewport (visual-tests/
                        // playwright.config.ts uses 1280x720) so both suites judge the same layout.
                        // This is load-bearing, not cosmetic: StyledDatePicker and StyledTimePicker
                        // branch on `useIsMobileView()` (<=768px) and render a bottom-sheet Drawer
                        // instead of the popper below that, and StyledDialog goes fullScreen under
                        // `(max-width: 743px)`. At the default test-iframe width these tests silently
                        // exercised the MOBILE component and would have reported its behaviour as the
                        // desktop contract.
                        viewport: { width: 1280, height: 720 },
                        // A failing assertion here is about focus and ARIA, which a PNG cannot show
                        // — and the artefacts land in `src/**/__screenshots__/`, next to the tests,
                        // where they are easy to commit by accident and easy to mistake for the VRT
                        // baselines in visual-tests/__screenshots__/ that ASMA-8140 owns.
                        screenshotFailures: false,
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
