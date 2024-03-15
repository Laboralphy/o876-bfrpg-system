/**
 * changes class type.
 * @param state {BFStoreState}
 * @param value {string}
 */
module.exports = ({ state }, { value}) => {
    state.classType = value
}