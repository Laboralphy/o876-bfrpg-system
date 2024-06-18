const CONSTS = require('../../consts')
const PickInputOutput = require('../../libs/pick-input-output')

/**
 * returns the amount of current hit points
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {*}
 * @returns {{value: number, capacity: number}}
 */
module.exports = (state, getters, externals) => {
    const pio = new PickInputOutput(externals['carrying-capacity'], 'strength', 'value')
    const capacity = pio.getValue(getters.getAbilities[CONSTS.ABILITY_STRENGTH])
    const value = state.encumbrance
    const factor = Math.max(0, Math.min(1, 1 - (value - capacity) / capacity))
    return {
        value,
        capacity,
        factor
    }
}
