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
    const { attackBonus: nBaseAttackBonus } = getters.getClassTypeData
    const weapon = getters.getSelectedWeapon
    const ranged = weapon && weapon.attributes.include(CONSTS.WEAPON_ATTRIBUTE_RANGED)
    const nAttackModifiers = ranged
        ? getRangedAttackModifiers(getters)
        : getMeleeAttackModifiers(getters)
    return nBaseAttackBonus + nAttackModifiers
}

/**
 * Returns the attack bonus of the selected action
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @returns {number}
 */
module.exports = (state, getters) => {
    const action = getters.getSelectedAction
    const nMonsterAttackBonus = state.monsterData.modifiers.attack
    switch (action.attackType) {
        case CONSTS.ATTACK_TYPE_ANY: {
            return nMonsterAttackBonus + getSelectedWeaponAttackBonus(state, getters)
        }

        case CONSTS.ATTACK_TYPE_RANGED:
        case CONSTS.ATTACK_TYPE_RANGED_TOUCH: {
            return nMonsterAttackBonus + getRangedAttackModifiers(getters)
        }

        case CONSTS.ATTACK_TYPE_MELEE:
        case CONSTS.ATTACK_TYPE_MELEE_TOUCH:
        case CONSTS.ATTACK_TYPE_MULTI_MELEE: {
            return nMonsterAttackBonus + getMeleeAttackModifiers(getters)
        }

        default: {
            return 0
        }
    }
}