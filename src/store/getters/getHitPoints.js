const CONSTS = require('../../consts')

/**
 * returns the amount of current hit points
 * @param state
 * @param getters
 * @param externals
 * @returns {number}
 */
module.exports = (state, getters, externals) => {
    return Math.max(0, Math.min(getters.getMaxHitPoints, state.gauges.hitPoints))
}