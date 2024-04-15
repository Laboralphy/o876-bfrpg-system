const {aggregateModifiers} = require("../../aggregator");
const CONSTS = require("../../consts");


function getRangedAttackModifiers (getters) {
    const { sum: nAttackModifierRanged } = aggregateModifiers([
        CONSTS.ITEM_PROPERTY_ATTACK_MODIFIER,
        CONSTS.EFFECT_ARMOR_CLASS_MODIFIER
    ], getters, {
        effectFilter: effect => effect.data.type === CONSTS.ATTACK_TYPE_RANGED || effect.data.type === CONSTS.ATTACK_TYPE_ANY,
        propFilter: prop => prop.data.type === CONSTS.ATTACK_TYPE_RANGED || prop.data.type === CONSTS.ATTACK_TYPE_ANY
    })
    return nAttackModifierRanged
}

function getMeleeAttackModifiers (getters) {
    const { sum: nAttackModifierMelee } = aggregateModifiers([
        CONSTS.ITEM_PROPERTY_ATTACK_MODIFIER,
        CONSTS.EFFECT_ARMOR_CLASS_MODIFIER
    ], getters, {
        effectFilter: effect => effect.data.type === CONSTS.ATTACK_TYPE_MELEE || effect.data.type === CONSTS.ATTACK_TYPE_ANY,
        propFilter: prop => prop.data.type === CONSTS.ATTACK_TYPE_MELEE || prop.data.type === CONSTS.ATTACK_TYPE_ANY
    })
    return nAttackModifierMelee
}

function getSelectedWeaponAttackBonus (state, getters) {
    const weapon = getters.getSelectedWeapon
    const ranged = weapon && weapon.attributes.includes(CONSTS.WEAPON_ATTRIBUTE_RANGED)
    return ranged
        ? (getRangedAttackModifiers(getters) + getters.getAbilityModifiers[CONSTS.ABILITY_DEXTERITY])
        : (getMeleeAttackModifiers(getters) + getters.getAbilityModifiers[CONSTS.ABILITY_STRENGTH])
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
    const action = getters.getSelectedAction
    if (action) {
        switch (action.attackType) {
            case CONSTS.ATTACK_TYPE_RANGED:
            case CONSTS.ATTACK_TYPE_RANGED_TOUCH: {
                return nLevelAttackBonus +
                    getters.getAbilityModifiers[CONSTS.ABILITY_DEXTERITY] +
                    getRangedAttackModifiers(getters)
            }

            default: {
                return nLevelAttackBonus +
                    getters.getAbilityModifiers[CONSTS.ABILITY_STRENGTH] +
                    getMeleeAttackModifiers(getters)
            }
        }
    } else {
        return nLevelAttackBonus +
            getters.getAbilityModifiers[CONSTS.ABILITY_STRENGTH] +
            getMeleeAttackModifiers(getters)
    }
}