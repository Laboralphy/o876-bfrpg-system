/**
 *
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @returns {Object<string, BFEffect>}
 */
module.exports = (state, getters) => {
    const oRegistry = {}
    getters.getEffects.forEach(effect => {
        oRegistry[effect.id] = effect
    })
    return oRegistry
}