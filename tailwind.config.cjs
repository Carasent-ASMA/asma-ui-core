const twConfigs = require('./tailwind-configs/tw_configs.cjs')
const colors = require('./src/styles/tokens/tokens.json')
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
        extend: {
            colors,
            boxShadow,
            animation,
            keyframes,
        },
    },
    darkMode: 'media',
}
