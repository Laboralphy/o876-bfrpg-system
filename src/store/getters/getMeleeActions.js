const CONSTS = require('../../consts')

/**
 * Return a list of action currently able to strike from distance
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @returns {string[]}
 */
module.exports = (state, getters) => {
    return Object
        .entries(getters.getActions)
        .filter(([, action]) => {
            return action.attackType === CONSTS.ATTACK_TYPE_MELEE_TOUCH ||
                action.attackType === CONSTS.ATTACK_TYPE_MELEE ||
                action.attackType === CONSTS.ATTACK_TYPE_MULTI_MELEE
        })
        .map(([key]) => key)
}
