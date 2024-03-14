module.exports = ({ state }, { effect }) => {
    state.effects.push(effect)
    return state.effects[state.effects.length - 1]
}