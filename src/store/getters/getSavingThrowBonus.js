const CONSTS = require('../../consts')
const { aggregateModifiers } = require('../../aggregator')

/**
 *
 * @param state
 * @param getters
 * @returns {{[p: string]: number}}
 */
module.exports = (state, getters) => {
    const { sorter } = aggregateModifiers([
        CONSTS.ITEM_PROPERTY_SAVING_THROW_MODIFIER,
        CONSTS.EFFECT_SAVING_THROW_MODIFIER
    ], getters, {
        propSorter: prop => prop.data.savingThrow,
        effectSorter: effect => effect.data.savingThrow
    })
    const oAbilityBonus = getters.getAbilityModifiers
    const streg = {
        [CONSTS.SAVING_THROW_ANY]: 0,
        [CONSTS.SAVING_THROW_SPELL]: oAbilityBonus[CONSTS.ABILITY_WISDOM], // wisdom
        [CONSTS.SAVING_THROW_DEATH_RAY_POISON]: oAbilityBonus[CONSTS.ABILITY_CONSTITUTION], // constitution
        [CONSTS.SAVING_THROW_PARALYSIS_PETRIFY]: oAbilityBonus[CONSTS.ABILITY_STRENGTH], // strength
        [CONSTS.SAVING_THROW_DRAGON_BREATH]: oAbilityBonus[CONSTS.ABILITY_DEXTERITY], // dexterity
        [CONSTS.SAVING_THROW_MAGIC_WAND]: 0
    }
    const rd = getters.getRace
    for (const [savingThrow, value] of Object.entries(rd.savingThrows)) {
        streg[savingThrow] += value
    }
    Object
        .entries(sorter)
        .forEach(([savingThrow, { sum }]) => {
            streg[savingThrow] += sum
        })
    return streg
}
