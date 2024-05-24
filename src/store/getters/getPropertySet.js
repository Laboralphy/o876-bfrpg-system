/**
 * Returns a Set of currently active item properties
 * @param state
 * @param getters {BFStoreGetters}
 * @returns {Set<string>}
 */
module.exports = (state, getters) =>
    getters
        .getProperties
        .reduce((prev, curr) => {
            prev.add(curr.type)
            return prev
        }, new Set())
