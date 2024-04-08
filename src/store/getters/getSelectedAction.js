/**
 * Returns current selected action
 * @param state {BFStoreState}
 * @returns {BFStoreStateAction}
 */
module.exports = state => {
    const md = state.monsterData
    const mdsa = md.selectedAction
    return mdsa
        ? md.actions[mdsa]
        : null
}