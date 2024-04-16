/**
 * If true, cannot fight
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 */
module.exports = (state, getters) => {
    return getters.getHitPoints <= 0
}