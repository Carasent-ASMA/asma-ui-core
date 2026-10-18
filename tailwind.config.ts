import type { Config } from 'tailwindcss'
import twConfigs from './tw-configs/twConfigs.json'

const boxShadow = twConfigs.boxShadow,
    animation = twConfigs.animation,
    keyframes = twConfigs.keyframes,
    fontFamily = twConfigs.fontFamily,
    width = twConfigs.width,
    maxWidth = twConfigs.maxWidth

export default {
    mode: 'jit',
    important: true,
    blocklist: ['rotate-180'],
    content: ['src/**/*.{js,jsx,ts,tsx}'],
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
    corePlugins: {
        preflight: false,
    },
    plugins: [require('tailwind-scrollbar')],
} satisfies Config
