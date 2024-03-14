module.exports = ({ state, getters }, { value }) => {
    state.gauges.hitPoints = Math.max(0, Math.min(getters.getMaxHitPoints, value))
}