const CONSTS = require('../../consts')

/**
 * returns the amount of current hit points
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {{}}
 * @returns {number}
 */
module.exports = (state, getters, externals) => {
    return Math.max(0, Math.min(getters.getMaxHitPoints, state.gauges.hitPoints))
}