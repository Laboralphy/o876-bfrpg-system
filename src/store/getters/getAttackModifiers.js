const CONSTS = require('../../consts')
const { aggregateModifiers } = require("../../aggregator");

/**
 * Gives a liste of attack modifier for melee and ranged attacks
 * use with getAttackBonus to have a complete attack modifier.
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @returns {{ranged: number, melee: number}}
 */
module.exports = (state, getters) => {
    const { sum: nAttackModifierMelee } = aggregateModifiers([
        CONSTS.ITEM_PROPERTY_ATTACK_MODIFIER,
        CONSTS.EFFECT_ARMOR_CLASS_MODIFIER
    ], getters, {
        effectFilter: effect => effect.data.type === CONSTS.ATTACK_TYPE_MELEE || effect.data.type === CONSTS.ATTACK_TYPE_ANY,
        propFilter: prop => prop.data.type === CONSTS.ATTACK_TYPE_MELEE || prop.data.type === CONSTS.ATTACK_TYPE_ANY
    })
    const { sum: nAttackModifierRanged } = aggregateModifiers([
        CONSTS.ITEM_PROPERTY_ATTACK_MODIFIER,
        CONSTS.EFFECT_ARMOR_CLASS_MODIFIER
    ], getters, {
        effectFilter: effect => effect.data.type === CONSTS.ATTACK_TYPE_RANGED || effect.data.type === CONSTS.ATTACK_TYPE_ANY,
        propFilter: prop => prop.data.type === CONSTS.ATTACK_TYPE_RANGED || prop.data.type === CONSTS.ATTACK_TYPE_ANY
    })
    return {
        melee: nAttackModifierMelee,
        ranged: nAttackModifierRanged
    }
}
