const CONSTS = require('../../consts')

/**
 * Returns the effective range of a weapon
 * @param weapon {BFItem}
 * @param externals {*}
 * @returns {number}
 */
function getWeaponRange (weapon, externals) {
    if (weapon.attributes.includes(CONSTS.WEAPON_ATTRIBUTE_RANGED)) {
        return externals['weapon-ranges'].WEAPON_RANGE_ROOM
    }
    if (weapon.attributes.includes(CONSTS.WEAPON_ATTRIBUTE_REACH)) {
        return externals['weapon-ranges'].WEAPON_RANGE_REACH
    }
    return externals['weapon-ranges'].WEAPON_RANGE_MELEE
}

/**
 * returns the effective range of an action, or 0 if action is weaponized
 * @param action {BFStoreStateAction}
 * @param externals {*}
 * @returns {number}
 */
function getActionRange (action, externals) {
    if (action.name === CONSTS.DEFAULT_ACTION_WEAPON) {
        return 0
    }
    if (action.name === CONSTS.DEFAULT_ACTION_UNARMED) {
        return externals['weapon-ranges'].WEAPON_RANGE_MELEE
    }
    switch (action.attackType) {
        case CONSTS.ATTACK_TYPE_RANGED_TOUCH:
        case CONSTS.ATTACK_TYPE_RANGED: {
            return externals['weapon-ranges'].WEAPON_RANGE_ROOM
        }

        case CONSTS.ATTACK_TYPE_HOMING:
        case CONSTS.ATTACK_TYPE_MELEE_TOUCH:
        case CONSTS.ATTACK_TYPE_MELEE:
        case CONSTS.ATTACK_TYPE_MULTI_MELEE: {
            return externals['weapon-ranges'].WEAPON_RANGE_MELEE
        }

        default: {
            return 0
        }
    }
}

/**
 * Return ranged of selected action and selected weapon
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {*}
 * @returns {{weapon: number, action: number}}
 */
module.exports = (state, getters, externals) => {
    const weapon = getters.getSelectedWeapon
    const action = getters.getSelectedAction
    return {
        weapon: weapon ? getWeaponRange(weapon, externals) : 0,
        action: action ? getActionRange(action, externals) : 0
    }
}
