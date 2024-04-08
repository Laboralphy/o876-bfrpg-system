const CONSTS = require('../../consts')

/**
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {{}}
 * @returns {CombatAction[]}
 */
module.exports = (state, getters, externals) => {
    const bEquippedRangedWeapon = !!getters.getEquipment[CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED]
    const bEquippedMeleeWeapon = !!getters.getEquipment[CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE]
    const mda = state.monsterData.actions
    const bHasNaturalWeapon = Object.keys(mda).length > 0
    const bWillUseImprovisedWeapon = !bHasNaturalWeapon && bEquippedRangedWeapon && !getters.isRangedWeaponLoaded
    const bWillUseUnarmedAttack = !bHasNaturalWeapon && !bEquippedMeleeWeapon && !bEquippedRangedWeapon
    const oActions = {}
    Object.entries(mda).forEach(([key, value]) => {
        oActions[key] = {
            ...value,
            name: key
        }
    })
    if (bEquippedMeleeWeapon || (bEquippedRangedWeapon && !bWillUseImprovisedWeapon)) {
        oActions[CONSTS.DEFAULT_ACTION_WEAPON] = externals['default-actions'][CONSTS.DEFAULT_ACTION_WEAPON]
    }
    if (bWillUseImprovisedWeapon) {
        oActions[CONSTS.DEFAULT_ACTION_WEAPON] = externals['default-actions'][CONSTS.DEFAULT_ACTION_IMPROVISED]
    }
    if (bWillUseUnarmedAttack) {
        oActions[CONSTS.DEFAULT_ACTION_WEAPON] = externals['default-actions'][CONSTS.DEFAULT_ACTION_UNARMED]
    }
    return oActions
}