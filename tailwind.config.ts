import { type Config } from 'tailwindcss'
import twConfigs from './tw-configs/twConfigs.json'

const boxShadow = twConfigs.boxShadow,
    animation = twConfigs.animation,
    keyframes = twConfigs.keyframes,
    fontFamily = twConfigs.fontFamily

export default {
    mode: 'jit',
    important: true,
    content: ['src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        fontFamily,
        extend: {
            colors: { ...twConfigs.colors },
            boxShadow,
            animation,
            keyframes,
        },
    },
    darkMode: 'media',
    corePlugins: {
        preflight: false,
    },
    plugins: [require('tailwind-scrollbar')],
} satisfies Config
