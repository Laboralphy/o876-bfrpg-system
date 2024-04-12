/**
 * changes creature natural class armor.
 * @param state {BFStoreState}
 * @param value {number}
 */
module.exports = ({ state }, { value }) => {
    state.naturalArmorClass = value
}