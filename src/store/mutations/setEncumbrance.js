/**
 * Sets the character encumbrance
 * @param state {BFStoreState}
 * @param value {number}
 */
module.exports = ({ state },  { value }) => {
    state.encumbrance = value
}