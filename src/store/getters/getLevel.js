const CONSTS = require('../../consts')
const { aggregateModifiers } = require('../../aggregator')
/**
 *
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @returns {number}
 */
module.exports = (state, getters) => Math.max(1, state.level - aggregateModifiers([
    CONSTS.EFFECT_NEGATIVE_LEVEL
], getters).sum)