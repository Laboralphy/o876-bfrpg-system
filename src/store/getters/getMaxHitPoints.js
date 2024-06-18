const CONSTS = require('../../consts')

/**
 * returns the amount of maximum hit points a character may have
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {{}}
 * @returns {number}
 */
module.exports = (state, getters, externals) => {
    const raceData = getters.getRace
    const nRaceMaxHitDice = raceData.maxHitDice || Infinity
    const { hitDieValue, hitPointBonus, maxHitDice, level } = getters.getClassTypeData
    const nFinalMaxHitDice = Math.min(nRaceMaxHitDice, maxHitDice)
    const nLevelBelow9 = Math.min(nFinalMaxHitDice, level)
    const nLevelOver9 = Math.max(level - nFinalMaxHitDice, 0)
    const nHPPerLevelBelow9 = Math.max(1, hitDieValue + getters.getAbilityModifiers[CONSTS.ABILITY_CONSTITUTION])
    return nLevelBelow9 * nHPPerLevelBelow9 + nLevelOver9 * hitPointBonus
}