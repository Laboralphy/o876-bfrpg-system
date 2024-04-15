/**
 * Returns a Set of currently active effects
 * @param state
 * @param getters {BFStoreGetters}
 * @returns {Set<string>}
 */
module.exports = (state, getters) =>
    getters
        .getEffects
        .reduce((prev, curr) => {
            prev.add(curr.type)
            return prev
        }, new Set())

