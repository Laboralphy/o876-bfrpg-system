/**
 * @param state {BFStoreState}
 * @param effect {BFEffect}
 * @param getters {BFStoreGetters}
 * @returns {BFEffect}
 */
module.exports = ({ state, getters }, { effect }) => {
    state.effects.push(effect)
    return state.effects[state.effects.length - 1]
}