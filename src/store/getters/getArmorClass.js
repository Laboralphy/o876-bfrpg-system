const CONSTS = require('../../consts')
const { aggregateModifiers } = require("../../aggregator");

/**
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @return {{natural: number, ranged: number, equipment: number, melee: number}}
 */
module.exports = (state, getters) => {
    const oArmor = getters.getEquipment[CONSTS.EQUIPMENT_SLOT_CHEST]
    const oShield = getters.getEquipment[CONSTS.EQUIPMENT_SLOT_CHEST]
    const naturalArmorClass = state.naturalArmorClass
    const { sum: nACBonusAny } = aggregateModifiers([
    ], getters, {
        effectFilter: effect => effect.data.type === CONSTS.ATTACK_TYPE_ANY,
        propFilter: prop => prop.data.type === CONSTS.ATTACK_TYPE_ANY
    })
    const { sum: nACBonusMelee } = aggregateModifiers([
        CONSTS.ITEM_PROPERTY_ARMOR_CLASS_MODIFIER,
        CONSTS.EFFECT_ARMOR_CLASS_MODIFIER
    ], getters, {
        effectFilter: effect => effect.data.type === CONSTS.ATTACK_TYPE_MELEE || effect.data.type === CONSTS.ATTACK_TYPE_ANY,
        propFilter: prop => prop.data.type === CONSTS.ATTACK_TYPE_MELEE || prop.data.type === CONSTS.ATTACK_TYPE_ANY
    })
    const { sum: nACBonusRanged } = aggregateModifiers([
        CONSTS.ITEM_PROPERTY_ARMOR_CLASS_MODIFIER,
        CONSTS.EFFECT_ARMOR_CLASS_MODIFIER
    ], getters, {
        effectFilter: effect => effect.data.type === CONSTS.ATTACK_TYPE_RANGED || effect.data.type === CONSTS.ATTACK_TYPE_ANY,
        propFilter: prop => prop.data.type === CONSTS.ATTACK_TYPE_RANGED || prop.data.type === CONSTS.ATTACK_TYPE_ANY
    })
    const nEquipmentAC = naturalArmorClass + (oArmor?.ac || 0) + (oShield?.ac || 0)
    return {
        natural: naturalArmorClass,
        equipment: nEquipmentAC,
        melee: nEquipmentAC + nACBonusMelee,
        ranged: nEquipmentAC + nACBonusRanged
    }
}