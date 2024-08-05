const CONSTS = require('../../consts')

/**
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @returns {boolean}
 */
module.exports = (state, getters) => {
    const weapon = getters.getEquipment[CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED]
    if (!weapon) {
        return false
    }
    if (weapon.attributes.includes(CONSTS.WEAPON_ATTRIBUTE_AMMUNITION)) {
        const sAmmoType = weapon.ammoType
        const oAmmo = getters.getEquipment[CONSTS.EQUIPMENT_SLOT_AMMO]
        return Boolean(oAmmo && (oAmmo.ammoType === sAmmoType))
    } else {
        return true
    }
}