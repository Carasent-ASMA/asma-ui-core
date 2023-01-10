const twRootColors = require('./tw_root_colors.cjs')
const twThemeDefaultColors = require('./tw_theme_default_colors.cjs')
const twThemeFretexColors = require('./tw_theme_fretex_colors.cjs')
const twThemeAdcurisColors = require('./tw_theme_adcuris_colors.cjs')

module.exports = {
    DEFAULT: {
        colors: {
            ...twRootColors,
            ...twThemeDefaultColors,
        },
    },
    '[data-theme="fretex"]': {
        colors: {
            ...twThemeFretexColors,
        },
    },
    '[data-theme="adcuris"]': {
        colors: {
            ...twThemeAdcurisColors,
        },
    },
}
