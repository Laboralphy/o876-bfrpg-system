const CONSTS = require("../../consts");

/**
 * Returns list of properties on the selected weapon only
 * includes ammo properties if ranged weapon is properly loaded with the right ammunition type
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @returns {BFItemProperty[]}
 */
module.exports = (state, getters) => {
    const weapon = getters.getSelectedWeapon
    if (weapon && getters.isSelectedWeaponUsable) {
        const aAmmoProperties = weapon.attributes.includes(CONSTS.WEAPON_ATTRIBUTE_RANGED)
            ? state.equipment[CONSTS.EQUIPMENT_SLOT_AMMO].properties
            : []
        return [
            ...weapon.properties,
            ...aAmmoProperties
        ]
    } else {
        return []
    }
}
