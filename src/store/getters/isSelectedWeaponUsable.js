const CONSTS = require('../../consts')

/**
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @returns {boolean}
 */
module.exports = (state, getters) => {
    const weapon = getters.getSelectedWeapon
    if (!weapon) {
        return false
    }
    const wr = getters.getWeaponSizeRestrictionSet
    if (!wr.has(weapon.size)) {
        return false
    }
    if (weapon.attributes.includes(CONSTS.WEAPON_ATTRIBUTE_RANGED)) {
        return getters.isRangedWeaponLoaded
    }
    return true
}