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
    const nModifier = aggregateModifiers([
            CONSTS.EFFECT_SPEED_MODIFIER,
            CONSTS.ITEM_PROPERTY_SPEED_MODIFIER
        ], getters
    ).sum
    return Math.max(0, state.speed + nModifier)
}