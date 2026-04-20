// @ts-check
import eslint from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'
import deMorgan from 'eslint-plugin-de-morgan'
// import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import reactYouMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect'
import * as regexpPlugin from 'eslint-plugin-regexp'
// import sonarjs from 'eslint-plugin-sonarjs'
import storybook from 'eslint-plugin-storybook'
import tseslint from 'typescript-eslint'

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    // tseslint.configs.stylistic,
    // tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    globalIgnores([
        'node_modules/**',
        'dist/**',
        'build/**',
        '.vscode/**',
        'configs',
        '/src/*.spec.js',
        '/src/**/*.spec.js',
        '/src/*.test.js',
        '/src/**/*.test.js',
        'src/index.html',
        'index.html',
        'src/**/*.stories.*',
        '!.storybook',
    ]),
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            parserOptions: {
                projectService: {
                    allowDefaultProject: ['eslint.config.js'],
                    defaultProject: 'tsconfig.json',
                },
            },
            sourceType: 'module',
        },
        plugins: {
            'better-tailwindcss': eslintPluginBetterTailwindcss,
        },
        rules: {
            ...eslintPluginBetterTailwindcss.configs['recommended-warn'].rules,
            ...eslintPluginBetterTailwindcss.configs['recommended-error'].rules,

            // NOTE: enable this when we have none of the other tailwind related errors
            'better-tailwindcss/enforce-consistent-line-wrapping': ['off', { printWidth: 100 }],

            '@typescript-eslint/restrict-template-expressions': [
                'error',
                {
                    allowNumber: true,
                },
            ],
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/explicit-module-boundary-types': 'error',
            '@typescript-eslint/no-empty-object-type': [
                'error',
                {
                    allowInterfaces: 'with-single-extends',
                },
            ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                    vars: 'all',
                    varsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/switch-exhaustiveness-check': 'error',
            '@typescript-eslint/unbound-method': 'off',
        },
    },
    {
        ...reactPlugin.configs.flat.recommended,
        rules: {
            'react/react-in-jsx-scope': 'off',
        },
    },
    reactHooksPlugin.configs.flat.recommended,
    reactYouMightNotNeedAnEffect.configs.recommended,
    regexpPlugin.configs['flat/recommended'],
    // {
    //     files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    //     ...jsxA11y.flatConfigs.recommended,
    //     languageOptions: {
    //         ...jsxA11y.flatConfigs.recommended.languageOptions,
    //         // globals: {
    //         //   ...globals.serviceworker,
    //         //   ...globals.browser,
    //         // },
    //     },
    // },
    // sonarjs.configs.recommended,
    deMorgan.configs.recommended,
    storybook.configs['flat/recommended'],
)
