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
        .filter(([sKey, action]) => {
            const at = action.attackType
            if (sKey === CONSTS.DEFAULT_ACTION_WEAPON) {
                return getters.getSelectedWeapon &&
                    getters.getSelectedWeapon.attributes.includes(CONSTS.WEAPON_ATTRIBUTE_RANGED) &&
                    getters.isRangedWeaponLoaded


            }
            return at === CONSTS.ATTACK_TYPE_RANGED ||
                at === CONSTS.ATTACK_TYPE_RANGED_TOUCH
        })
        .map(([key]) => key)
}
