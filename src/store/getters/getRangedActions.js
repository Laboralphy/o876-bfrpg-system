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
            return at === CONSTS.ATTACK_TYPE_RANGED ||
                at === CONSTS.ATTACK_TYPE_RANGED_TOUCH ||
                at === CONSTS.ATTACK_TYPE_HOMING
        })
        .map(([key]) => key)
}
