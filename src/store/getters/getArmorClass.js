const CONSTS = require('../../consts')
const { aggregateModifiers } = require('../../aggregator')
const {
    filterMeleeAttackTypes,
    filterRangedAttackTypes
} = require('../../libs/effect-prop-need-roll')

/**
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @return {{natural: number, ranged: number, equipment: number, melee: number}}
 */
module.exports = (state, getters) => {
    const oArmor = getters.getEquipment[CONSTS.EQUIPMENT_SLOT_CHEST]
    const oShield = getters.isWieldingTwoHandedWeapon
        ? null
        : getters.getEquipment[CONSTS.EQUIPMENT_SLOT_SHIELD]
    const naturalArmorClass = state.naturalArmorClass
    const { sum: nACBonusMelee } = aggregateModifiers([
        CONSTS.ITEM_PROPERTY_ARMOR_CLASS_MODIFIER,
        CONSTS.EFFECT_ARMOR_CLASS_MODIFIER
    ], getters, {
        effectFilter: filterMeleeAttackTypes,
        propFilter: filterMeleeAttackTypes
    })
    const { sum: nACBonusRanged } = aggregateModifiers([
        CONSTS.ITEM_PROPERTY_ARMOR_CLASS_MODIFIER,
        CONSTS.EFFECT_ARMOR_CLASS_MODIFIER
    ], getters, {
        effectFilter: filterRangedAttackTypes,
        propFilter: filterRangedAttackTypes
    })
    const nEquipmentAC = naturalArmorClass + (oArmor?.ac || 0) + (oShield?.ac || 0)
    return {
        natural: naturalArmorClass,
        equipment: nEquipmentAC,
        melee: nEquipmentAC + nACBonusMelee,
        ranged: nEquipmentAC + nACBonusRanged
    }
}