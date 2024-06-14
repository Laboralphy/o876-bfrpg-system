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
    // If cannot act or see : no dexterity bonus and no shield bonus ; equipment armor steel count
    const bCanActAndSee = getters.getCapabilities.act && getters.getCapabilities.see
    const nACDexBonus = bCanActAndSee ? getters.getAbilityModifiers[CONSTS.ABILITY_DEXTERITY] : 0
    const nACArmorBonus = oArmor?.ac || 0
    const nACShieldBonus = bCanActAndSee ? (oShield?.ac || 0) : 0
    const nEquipmentAC = naturalArmorClass + nACDexBonus + nACArmorBonus + nACShieldBonus
    return {
        natural: naturalArmorClass,
        equipment: nEquipmentAC,
        melee: nEquipmentAC + nACBonusMelee,
        ranged: nEquipmentAC + nACBonusRanged
    }
}