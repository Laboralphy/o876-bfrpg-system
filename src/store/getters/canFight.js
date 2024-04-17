const CONSTS = require('../../consts')

/**
 *
 * @param state
 * @param getters
 * @return {boolean}
 */
module.exports = (state, getters) => {
    const aConditionSet = getters.getConditionSet
    if (aConditionSet.has(CONSTS.CONDITION_STUNNED) ||
        aConditionSet.has(CONSTS.CONDITION_INCAPACITATED) ||
        aConditionSet.has(CONSTS.CONDITION_PARALYZED) ||
        aConditionSet.has(CONSTS.CONDITION_PETRIFIED) ||
        aConditionSet.has(CONSTS.CONDITION_UNCONSCIOUS)
    ) {
        return false
    }
    return true
}