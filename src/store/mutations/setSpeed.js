/**
 * changes creature speed.
 * @param state {BFStoreState}
 * @param value {number}
 */
module.exports = ({ state }, { value }) => {
    state.speed = value
}