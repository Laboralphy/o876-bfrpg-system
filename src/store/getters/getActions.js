/**
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {{}}
 * @returns {Object<string, CombatAction>}
 */
module.exports = (state, getters, externals) => {
    const oActions = state.monsterData.actions
    if (Object.keys(oActions).length > 0) {
        return oActions
    } else {
        return {
            [externals['default-actions'].DEFAULT_ACTION_UNARMED.name]: externals['default-actions'].DEFAULT_ACTION_UNARMED
        }
    }
}
