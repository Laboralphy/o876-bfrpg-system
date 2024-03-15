/**
 * changes value of an ability
 * @param state {BFStoreState}
 * @param ability {string}
 * @param value {number}
 */
module.exports = ({ state }, { ability, value }) => {
    if (ability in state.abilities) {
        state.abilities[ability] = value
    } else {
        throw new ReferenceError(`This ability does not exist ${ability}`)
    }
}