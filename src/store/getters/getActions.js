/**
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {{}}
 * @returns {Object<string, CombatAction>}
 */
module.exports = (state, getters, externals) => {
    return state.monsterData.actions
}
