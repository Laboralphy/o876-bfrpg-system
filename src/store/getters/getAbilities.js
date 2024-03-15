const CONSTS = require('../../consts')

/**
 * List of all ability modifiers
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @returns {Object<string, number>}
 */
module.exports = (state, getters) => {
    return state.abilities
}