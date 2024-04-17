/**
 * If true, cannot fight
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @return {boolean}
 */
module.exports = (state, getters) => {
    return getters.getHitPoints <= 0
}