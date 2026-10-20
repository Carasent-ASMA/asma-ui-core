import { readFileSync, readdirSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts'
import packageJson from './package.json'
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

/** Minimal structural subset of PostCSS's `Root`/`Rule`/`Declaration`, so this file needs no `postcss` dependency. */
interface PostcssDeclaration {
    prop: string
    value: string
    remove: () => void
    clone: (overrides?: { prop?: string; value?: string }) => PostcssDeclaration
}

interface PostcssRule {
    selector: string
    walkDecls: (callback: (declaration: PostcssDeclaration) => void) => void
    append: (declaration: PostcssDeclaration) => unknown
}

interface PostcssRoot {
    walkDecls: (callback: (declaration: PostcssDeclaration) => void) => void
    walkRules: (callback: (rule: PostcssRule) => void) => void
}

/**
 * v3 ran with `corePlugins.preflight: false`, so a width utility (`border`, `border-b`, `border-t`,
 * `border-x`, …) emitted only `border-*-width` and drew nothing — `border-style` kept its initial
 * `none`. Tailwind v4 also emits `border-style: var(--tw-border-style)` (default `solid`) from the
 * same utilities, which paints 1px hairlines and adds 1px to every auto-sized box. That is a
 * production change, not a Storybook one: Ad Voca has a global `*{border:0 solid}` reset, the shell
 * (`shell/asma-app-shell/src/styles/index.scss`) has none, and the committed VRT baselines were
 * captured against v3. Dropping only the generated `var(--tw-border-style)` declarations restores
 * v3 rendering everywhere while keeping every explicit style intact (`border-solid`,
 * `border-dashed`, `border-none`, and our custom `border-*-solid` utilities all emit a literal).
 *
 * Remove this shim once the team adopts v4 border behaviour and re-baselines.
 */
const GENERATED_BORDER_STYLE_PROPERTY = /^border(-(top|right|bottom|left|inline|block)(-(start|end))?)?-style$/

const stripGeneratedBorderStyles = {
    postcssPlugin: 'asma-strip-generated-border-style',
    Once(root: PostcssRoot) {
        root.walkDecls((declaration) => {
            if (!GENERATED_BORDER_STYLE_PROPERTY.test(declaration.prop)) return
            // PostCSS keeps `!important` on the declaration, not in `value`, so this covers both.
            if (declaration.value.trim() !== 'var(--tw-border-style)') return
            declaration.remove()
        })
    },
}

/**
 * `space-y-*` / `space-x-*` are the second place where v4 assumes preflight reset every margin.
 * v3 spaced the *following* siblings (`> :not([hidden]) ~ :not([hidden])`) with `margin-top` /
 * `margin-left`; v4 spaces every child except the last with `margin-block-end` **and** pins
 * `margin-block-start: 0`, so the user-agent margins of `<p>`/`<ul>`/`<li>` — still present because
 * preflight is off — stop collapsing as they did. A `space-y-2` card holding a `<p>` and a `<ul>`
 * grows by 64px (DataDisplay/AIDisclosure "Documentation"). Rewriting the generated rule back to
 * v3's selector and margin sides restores the baselines; for children without margins the two
 * forms are already equivalent, so nothing else moves.
 *
 * Remove this shim together with the border-style one.
 */
const restoreV3SpaceBetween = {
    postcssPlugin: 'asma-restore-v3-space-between',
    Once(root: PostcssRoot) {
        root.walkRules((rule) => {
            const axis = /\.-?space-([xy])-/.exec(rule.selector)?.[1]
            if (axis !== 'y' && axis !== 'x') return
            if (!rule.selector.includes(':not(:last-child)')) return

            const [blockStart, blockEnd, start, end] =
                axis === 'y'
                    ? ['margin-block-start', 'margin-block-end', 'margin-top', 'margin-bottom']
                    : ['margin-inline-start', 'margin-inline-end', 'margin-left', 'margin-right']

            let startOffset: PostcssDeclaration | undefined
            let endOffset: PostcssDeclaration | undefined
            rule.walkDecls((declaration) => {
                if (declaration.prop === blockStart) startOffset = declaration
                if (declaration.prop === blockEnd) endOffset = declaration
            })
            if (!startOffset || !endOffset) return

            // v3: margin-top = spacing * (1 - reverse) (v4's block-end), margin-bottom = spacing * reverse
            rule.append(endOffset.clone({ prop: start }))
            rule.append(startOffset.clone({ prop: end }))
            startOffset.remove()
            endOffset.remove()
            rule.selector = rule.selector.replace(':not(:last-child)', ':not([hidden]) ~ :not([hidden])')
            // v4 wraps the rule in `:where()`, which zeroes its specificity so a margin utility such
            // as `m-0` wins. v3's selector took precedence over those utilities; drop the wrapper so
            // the cascade order matches master (e.g. StyledFormControlLabel's `m-0` inside a
            // `space-y-2` panel).
            const unwrapped = /^:where\((.*)\)$/.exec(rule.selector)
            if (unwrapped?.[1]) rule.selector = unwrapped[1]
        })
    },
}

const currentDirectory =
    typeof import.meta.dirname !== 'undefined' ? import.meta.dirname : path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    plugins: [
        react({
            jsxRuntime: 'automatic',
        }),
        tailwindcss(),
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
                // ASMA-7729: the forms adapter ships under its own entry; its tests must not leak
                // `.d.ts` files into the tarball (same tarball-reduction reason as ASMA-8139 above).
                'src/forms/**/*.test.ts',
                'src/forms/**/*.test.tsx',
            ],
        }),
    ],
    resolve: {
        alias: {
            src: path.resolve(currentDirectory, 'src'),
            'asma-ui-core': path.resolve(currentDirectory, 'src', 'index.ts'),
        },
    },
    css: {
        postcss: {
            plugins: [stripGeneratedBorderStyles, restoreV3SpaceBetween],
        },
    },
    build: {
        minify: 'esbuild',
        lib: {
            entry: {
                index: resolve('src', 'index.ts'),
                'forms/index': resolve('src', 'forms', 'index.ts'),
            },
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
