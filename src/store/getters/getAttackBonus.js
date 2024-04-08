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
    const action = getters.getSelectedAction
    if (!action) {
        return 0
    }
    // Monster attack bonus adjustment as defined in monster data table
    const nMonsterAttackBonus = state.monsterData.modifiers.attack
    // Attack bonus gained with level
    const nLevelAttackBonus = getters.getClassTypeData.attackBonus
    switch (action.attackType) {
        case CONSTS.ATTACK_TYPE_ANY: {
            return nLevelAttackBonus + nMonsterAttackBonus + getSelectedWeaponAttackBonus(state, getters)
        }

        case CONSTS.ATTACK_TYPE_RANGED:
        case CONSTS.ATTACK_TYPE_RANGED_TOUCH: {
            return nLevelAttackBonus + nMonsterAttackBonus + getters.getAbilityModifiers[CONSTS.ABILITY_DEXTERITY] + getRangedAttackModifiers(getters)
        }

        case CONSTS.ATTACK_TYPE_MELEE:
        case CONSTS.ATTACK_TYPE_MELEE_TOUCH:
        case CONSTS.ATTACK_TYPE_MULTI_MELEE: {
            return nLevelAttackBonus + nMonsterAttackBonus + getters.getAbilityModifiers[CONSTS.ABILITY_STRENGTH] + getMeleeAttackModifiers(getters)
        }

        default: {
            return 0
        }
    }
}