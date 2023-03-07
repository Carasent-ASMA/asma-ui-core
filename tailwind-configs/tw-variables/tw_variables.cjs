const twRootColors = require('./tw_root_colors.cjs')
const twThemeDefaultColors = require('./tw_theme_default_colors.cjs')
const twThemeFretexColors = require('./tw_theme_fretex_colors.cjs')
const twThemeGreenishColors = require('./tw_theme_greenish_colors.cjs')

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
    '[data-theme="greenish"]': {
        colors: {
            ...twThemeGreenishColors,
        },
    },
}
