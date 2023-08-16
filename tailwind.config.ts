import { type Config } from 'tailwindcss'
import colors from './src/styles/tokens/tokens.json'
import fontSize from './src/styles/tokens/fontSize.json'
import twConfigs from './tw-configs/twConfigs.json'

const boxShadow = twConfigs.boxShadow,
    animation = twConfigs.animation,
    keyframes = twConfigs.keyframes

export default {
    mode: 'jit',
    important: true,
    content: ['src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        fontFamily: {
            roboto: ['Roboto'],
            sans: ['Source Sans Pro'],
        },
        fontSize: {
            sm: '0.75rem',
            base: '0.875rem',
            xl: '1.25rem',
            '2xl': '1.563rem',
            '3xl': '1.953rem',
            '4xl': '2.441rem',
            '5xl': '3.052rem',
        },
        extend: {
            colors: { ...colors, ...twConfigs.colors },
            boxShadow,
            animation,
            keyframes,
            fontSize,
        },
    },
    darkMode: 'media',
    corePlugins: {
        preflight: false,
    },
    plugins: [],
} satisfies Config
