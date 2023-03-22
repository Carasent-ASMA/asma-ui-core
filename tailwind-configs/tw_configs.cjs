const twBoxShadow = require('./tw_box_shadow.cjs')
const twAnimation = require('./tw_animation.cjs')

module.exports = {
    boxShadow: twBoxShadow,
    animation: twAnimation.animation,
    keyframes: twAnimation.keyframes,
}
