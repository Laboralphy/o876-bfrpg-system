const { removeItem } = require('../../libs/array-mutations')

/**
 * Removes all effects that have a duration of 0
 * @param state {BFStoreState}
 */
module.exports = ({ state }) => {
    let i = 0
    const aEffects = state.effects
    while (i < aEffects.length) {
        const effect = aEffects[i]
        if (effect.duration <= 0) {
            removeItem(aEffects, i)
        } else {
            ++i
        }
    }
}