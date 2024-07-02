const {aggregateModifiers} = require("../../aggregator");
const CONSTS = require("../../consts");
const {
    filterMeleeAttackTypes,
    filterRangedAttackTypes
} = require('../../libs/effect-prop-need-roll')


function getRangedAttackModifiers (getters) {
    const { sum: nAttackModifierRanged } = aggregateModifiers([
        CONSTS.ITEM_PROPERTY_ATTACK_MODIFIER,
        CONSTS.EFFECT_ATTACK_MODIFIER
    ], getters, {
        effectFilter: filterRangedAttackTypes,
        propFilter: filterRangedAttackTypes
    })
    return nAttackModifierRanged
}

function getMeleeAttackModifiers (getters) {
    const { sum: nAttackModifierMelee } = aggregateModifiers([
        CONSTS.ITEM_PROPERTY_ATTACK_MODIFIER,
        CONSTS.EFFECT_ATTACK_MODIFIER
    ], getters, {
        effectFilter: filterMeleeAttackTypes,
        propFilter: filterMeleeAttackTypes
    })
    return nAttackModifierMelee
}

function getSelectedWeaponAttackBonus (state, getters) {
    const weapon = getters.getSelectedWeapon
    const ranged = weapon && weapon.attributes.includes(CONSTS.WEAPON_ATTRIBUTE_RANGED)
    const finesse = weapon && weapon.attributes.includes(CONSTS.WEAPON_ATTRIBUTE_FINESSE)
    const strength = getters.getAbilityModifiers[CONSTS.ABILITY_STRENGTH]
    const dexterity = getters.getAbilityModifiers[CONSTS.ABILITY_DEXTERITY]
    return ranged
        ? (getRangedAttackModifiers(getters) + dexterity)
        : finesse
            ? (getMeleeAttackModifiers(getters) + Math.max(dexterity, strength))
            : (getMeleeAttackModifiers(getters) + strength)
}

/**
 * Returns the attack bonus of the selected action
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @returns {number}
 */
module.exports = (state, getters) => {
    // Monster attack bonus adjustment as defined in monster data table
    // Attack bonus gained with level
    const nLevelAttackBonus = getters.getClassTypeData.attackBonus
    const weapon = getters.getSelectedWeapon
    if (weapon) {
        return nLevelAttackBonus + getSelectedWeaponAttackBonus(state, getters)
    }
    const nBlindnessMalus = getters.getCapabilities.see ? 0 : -4
    const action = getters.getSelectedAction
    if (action) {
        switch (action.attackType) {
            case CONSTS.ATTACK_TYPE_RANGED:
            case CONSTS.ATTACK_TYPE_RANGED_TOUCH: {
                return nLevelAttackBonus + nBlindnessMalus +
                    getters.getAbilityModifiers[CONSTS.ABILITY_DEXTERITY] +
                    getRangedAttackModifiers(getters)
            }

            default: {
                return nLevelAttackBonus + nBlindnessMalus +
                    getters.getAbilityModifiers[CONSTS.ABILITY_STRENGTH] +
                    getMeleeAttackModifiers(getters)
            }
        }
    } else {
        return nLevelAttackBonus + nBlindnessMalus +
            getters.getAbilityModifiers[CONSTS.ABILITY_STRENGTH] +
            getMeleeAttackModifiers(getters)
    }
}