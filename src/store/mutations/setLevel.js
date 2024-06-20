/**
 * changes creture level.
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param value {number}
 */
module.exports = ({ state, getters }, { value }) => {
    const nMaxLevel = getters.getClassTypeData.maxLevel
    state.level = Math.min(Math.max(1, value), nMaxLevel)
}