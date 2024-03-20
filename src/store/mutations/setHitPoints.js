/**
 * change creatures hit points
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param value {number}
 */
module.exports = ({ state, getters }, { value }) => {
    state.gauges.hitPoints = Math.max(0, Math.min(getters.getMaxHitPoints, value))
}