/**
 * Returns current selected action
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @returns {BFStoreStateAction}
 */
module.exports = (state, getters) => {
    const md = state.monsterData
    const mdsa = md.selectedAction
    if (!mdsa) {
        return null
    }
    const action = getters.getActions[mdsa]
    if (!action) {
        return null
    }
    return action
}