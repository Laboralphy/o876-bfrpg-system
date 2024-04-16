const CONSTS = require("../../consts");

/**
 * Returns list of equipped and selected weapons
 * includes ammo if ranged weapon is properly loaded with the right ammunition type
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @returns {{weapon: BFItem|null, ammo: BFItem|null}}
 */
module.exports = (state, getters) => {
    const weapon = getters.getSelectedWeapon
    if (weapon && getters.isSelectedWeaponUsable) {
        if (weapon.attributes.includes(CONSTS.WEAPON_ATTRIBUTE_RANGED)) {
            return { weapon, ammo: state.equipment[CONSTS.EQUIPMENT_SLOT_AMMO] }
        } else {
            return { weapon, ammo: null }
        }
    } else {
        return { weapon: null, ammo: null }
    }
}
