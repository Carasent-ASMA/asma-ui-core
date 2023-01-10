const twVariables = require('./tw-variables/tw_variables.cjs')
const twColors = require('./tw_colors.cjs')
const twFontFamily = require('./tw_fonts.cjs')
const twBoxShadow = require('./tw_box_shadow.cjs')
const twAnimation = require('./tw_animation.cjs')

module.exports = {
    variables: twVariables,
    colors: twColors,
    fontFamily: twFontFamily,
    boxShadow: twBoxShadow,
    animation: twAnimation.animation,
    keyframes: twAnimation.keyframes,
}
