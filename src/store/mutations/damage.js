/**
 * Inflict damage = decrease hit points (no type specified)
 * @param state {BFStoreState}
 * @param amount {number}
 */
module.exports = ({ state }, { amount }) => {
    if (isNaN(amount)) {
        throw new TypeError('damage amount must be a number. "' + amount + '" given')
    }
    state.gauges.hitPoints = state.gauges.hitPoints - Math.max(0, amount)
}
