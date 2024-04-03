const CONSTS = require("../../consts");

/**
 * Returns list of properties on the selected weapon only
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @returns {BFItemProperty[]}
 */
module.exports = (state, getters) => {
    const os = state.offensiveSlot
    const eqs = state.equipment[os]
    if (eqs) {
        const aAmmoProperties = eqs.attributes.includes(CONSTS.WEAPON_ATTRIBUTE_RANGED) && getters.isRangedWeaponLoaded
            ? state.equipment[CONSTS.EQUIPMENT_SLOT_AMMO].properties
            : []
        return [
            ...eqs.properties,
            ...aAmmoProperties
        ]
    } else {
        return []
    }
}
