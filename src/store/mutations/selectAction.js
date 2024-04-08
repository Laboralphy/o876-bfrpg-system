/**
 * Select current action
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param action {string}
 */
module.exports = ({ state, getters }, { action }) => {
    if (action === '' || (action in getters.getActions)) {
        state.monsterData.selectedAction = action
    } else {
        throw new Error('action "' + action +'" undefined - actions available: [' + Object.keys(getters.getActions).join(', ') + ']')
    }
}