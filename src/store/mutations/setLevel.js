/**
 * changes creture level.
 * @param state {BFStoreState}
 * @param value {number}
 */
module.exports = ({ state }, { value}) => {
    state.level = Math.max(1, value)
}