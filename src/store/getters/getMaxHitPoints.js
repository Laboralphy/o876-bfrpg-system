const CONSTS = require('../../consts')

/**
 * returns the amount of maximum hit points a character may have
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {{}}
 * @returns {number}
 */
module.exports = (state, getters, externals) => {
    const { hitDice, hitPointBonus, hitDiceMaxLevel } = externals['character-advancement'][state.classType]
    const nLevelBelow9 = Math.min(hitDiceMaxLevel, state.level)
    const nLevelOver9 = Math.max(state.level - hitDiceMaxLevel, 0)
    const nHPPerLevelBelow9 = Math.max(1, hitDice + getters.getAbilityModifiers[CONSTS.ABILITY_CONSTITUTION])
    return nLevelBelow9 * nHPPerLevelBelow9 + nLevelOver9 * hitPointBonus
}