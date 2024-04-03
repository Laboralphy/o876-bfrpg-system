/**
 * @param state {BFStoreState}
 * @param slot {string}
 * @returns {BFEffect}
 */
module.exports = ({ state }, { slot }) => {
    const oPrevItem = state.equipment[slot]
    state.equipment[slot] = null
    return oPrevItem
}