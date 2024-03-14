/**
 * changes character class type.
 * @param state
 * @param value {number}
 */
module.exports = ({ state }, { value}) => {
    state.level = Math.max(1, value)
}