/** @type {import('tailwindcss').Config} */
const defaultConfig = require('tailwindcss/defaultConfig')

module.exports = {
    roboto: ['Roboto', defaultConfig.theme.fontFamily.serif],
    slab: ['Roboto Slab', defaultConfig.theme.fontFamily.serif],
    sans: ['Source Sans Pro', defaultConfig.theme.fontFamily.sans],
}
