/**
 * @param state {BFStoreState}
 * @param effect {BFEffect}
 * @returns {BFEffect}
 */
module.exports = ({ state }, { effect }) => {
    state.effects.push(effect)
    return state.effects[state.effects.length - 1]
}