/**
 * Get a base attack bonus using attack bonus table, level.
 * Do not used gear or effect modifier, use with getAttackModifiers to have a complete result
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {{}}
 * @return {number}
 */
module.exports = (state, getters, externals) => {
    const { attackBonus } = getters.getClassTypeData
    return attackBonus
}