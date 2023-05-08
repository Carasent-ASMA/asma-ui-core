const twConfigs = require('./tailwind-configs/tw_configs.cjs')
const colors = require('./src/styles/tokens/tokens.json')
const fontSize = require('./src/styles/tokens/fontSize.json')
const defaultConfig = require('tailwindcss/defaultConfig')

const boxShadow = twConfigs.boxShadow,
    animation = twConfigs.animation,
    keyframes = twConfigs.keyframes

module.exports = {
    mode: 'jit',
    important: true,
    content: ['src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        fontFamily: {
            sans: ['Source Sans Pro', defaultConfig.theme.fontFamily.sans],
            roboto: ['Roboto', defaultConfig.theme.fontFamily.serif],
            slab: ['Roboto Slab', defaultConfig.theme.fontFamily.serif],
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
            colors,
            boxShadow,
            animation,
            keyframes,
            fontSize,
        },
    },
    darkMode: 'media',
}
