import type { Config } from 'tailwindcss'
import twConfigs from './tw-configs/twConfigs.json'

const boxShadow = twConfigs.boxShadow,
    animation = twConfigs.animation,
    keyframes = twConfigs.keyframes,
    fontFamily = twConfigs.fontFamily,
    width = twConfigs.width,
    maxWidth = twConfigs.maxWidth

/* The published CSS reaches every app on the page as unlayered `!important` rules, so the package
 * build (`pnpm build`) leaves out classes that only stories and tests use. A story's `grid-cols-1`
 * beat the apps' layered `tablet:grid-cols-*` and stacked workspace columns (ASMA-8701).
 * Storybook, VRT and the vitest projects still scan everything. */
const STORY_AND_TEST_SOURCES = [
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/story/**',
    '!src/**/stories/**',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/test-utils/**',
]
const isLibraryBuild = process.env['ASMA_UI_CORE_LIBRARY_BUILD'] === '1'

export default {
    // mode: 'jit',
    important: true,
    blocklist: ['rotate-180'],
    content: ['src/**/*.{js,jsx,ts,tsx}', ...(isLibraryBuild ? STORY_AND_TEST_SOURCES : [])],
    theme: {
        fontFamily,
        extend: {
            colors: { ...twConfigs.colors },
            boxShadow,
            animation,
            keyframes,
            width,
            maxWidth,
        },
    },
    darkMode: 'media',
    // corePlugins: {
    //     preflight: false,
    // },
    // plugins: [require('tailwind-scrollbar')],
} satisfies Config
