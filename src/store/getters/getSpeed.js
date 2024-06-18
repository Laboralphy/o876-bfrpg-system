const CONSTS = require('../../consts')
const { aggregateModifiers } = require('../../aggregator')

/**
 * returns the creature speed
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {{}}
 * @returns {number}
 */
module.exports = (state, getters, externals) => {
    let nModifier = 1
    const f = ({ amp }) => {
        nModifier *= amp
    }
    aggregateModifiers([
            CONSTS.EFFECT_SPEED_MODIFIER,
            CONSTS.ITEM_PROPERTY_SPEED_MODIFIER
        ], getters, {
            propForEach: f,
            effectForEach: f
        }
    )
    const encumbrance = getters.getEncumbrance
    return Math.max(0, state.speed * nModifier * encumbrance.factor)
}