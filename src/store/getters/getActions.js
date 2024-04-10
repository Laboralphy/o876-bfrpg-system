const CONSTS = require('../../consts')

/**
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {{}}
 * @returns {CombatAction[]}
 */
module.exports = (state, getters, externals) => {
    const mda = state.monsterData.actions
    const weapon = getters.getSelectedWeapon
    const bEquippedWeapon = !!weapon
    const bEquippedRangedWeapon = bEquippedWeapon && weapon.attributes.includes(CONSTS.WEAPON_ATTRIBUTE_RANGED)
    const bEquippedMeleeWeapon = bEquippedWeapon && !bEquippedRangedWeapon
    // True if weapon is melee, or ranged with ammunition
    const bWeaponCanBeUsed = bEquippedMeleeWeapon || (bEquippedRangedWeapon && getters.isRangedWeaponLoaded)
    // True if creature has natural weapon, like claws, or fangs
    const bHasNaturalWeapon = Object.keys(mda).length > 0
    // True if equipped with weapon but can't use weapon (ammunition)
    const bWillUseImprovisedWeapon = bEquippedRangedWeapon && !bWeaponCanBeUsed
    const bWillUseUnarmedAttack = !bHasNaturalWeapon && !bEquippedWeapon
    const oActions = {}
    Object.entries(mda).forEach(([key, value]) => {
        oActions[key] = {
            ...value,
            name: key
        }
    })
    if (bWeaponCanBeUsed) {
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
