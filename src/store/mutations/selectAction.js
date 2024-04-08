/**
 * Select current action
 * @param state {BFStoreState}
 * @param action {string}
 */
module.exports = ({ state }, { action }) => {
    if (state === '' || (action in state.monsterData.actions)) {
        state.monsterData.selectedAction = action
    }
}