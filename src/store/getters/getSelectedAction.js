/**
 * Returns current selected action
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @returns {BFStoreStateAction}
 */
module.exports = (state, getters) => {
    const sa = state.selectedAction
    if (!sa) {
        return null
    }
    const action = getters.getActions[sa]
    if (!action) {
        return null
    }
    return action
}