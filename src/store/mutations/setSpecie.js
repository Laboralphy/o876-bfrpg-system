/**
 * changes creature specie.
 * @param state {BFStoreState}
 * @param value {string}
 */
module.exports = ({ state }, { value }) => {
    state.specie = value
}