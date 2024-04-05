const CONSTS = require('../../consts')

/**
 * returns the amount of maximum hit points a character may have
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {{}}
 * @returns {number}
 */
module.exports = (state, getters, externals) => {
    const { hitDieValue, hitPointBonus, maxHitDice, level } = getters.getClassTypeData
    const nLevelBelow9 = Math.min(maxHitDice, level)
    const nLevelOver9 = Math.max(level - maxHitDice, 0)
    const nHPPerLevelBelow9 = Math.max(1, hitDieValue + getters.getAbilityModifiers[CONSTS.ABILITY_CONSTITUTION])
    return nLevelBelow9 * nHPPerLevelBelow9 + nLevelOver9 * hitPointBonus
}