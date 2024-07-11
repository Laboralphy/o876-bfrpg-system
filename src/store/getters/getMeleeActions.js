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
            const at = action.attackType
            return at === CONSTS.ATTACK_TYPE_MELEE_TOUCH ||
                at === CONSTS.ATTACK_TYPE_MELEE ||
                at === CONSTS.ATTACK_TYPE_MULTI_MELEE
        })
        .map(([key]) => key)
}
