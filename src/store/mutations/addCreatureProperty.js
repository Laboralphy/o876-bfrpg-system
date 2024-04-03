/**
 * @param state {BFStoreState}
 * @param property {BFItemProperty}
 * @returns {BFItemProperty}
 */
module.exports = ({ state }, { property }) => {
    state.properties.push(property)
    return state.properties[state.properties.length - 1]
}