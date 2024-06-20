const CONSTS = require('../../consts')
const { aggregateModifiers } = require('../../aggregator')

/**
 * returns the amount of maximum hit points a character may have
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {{}}
 * @returns {number}
 */
module.exports = (state, getters, externals) => {
    const nExtraHitPoints = aggregateModifiers([
        CONSTS.ITEM_PROPERTY_EXTRA_HITPOINTS
    ], getters).sum
    const raceData = getters.getRace
    const nRaceMaxHdPerLevel = raceData.maxHdPerLevel || Infinity
    const { hdPerLowerLevel, hdPerHigherLevel, lowerLevelCount, level } = getters.getClassTypeData
    const nLowerLevels = Math.min(lowerLevelCount, level)
    const nHigherLevels = Math.max(level - lowerLevelCount, 0)
    const nHdPerLowerLevel = Math.min(hdPerLowerLevel, nRaceMaxHdPerLevel)
    const nHPPerLowerLevel = Math.max(1, nHdPerLowerLevel + getters.getAbilityModifiers[CONSTS.ABILITY_CONSTITUTION])
    return nLowerLevels * nHPPerLowerLevel + nHigherLevels * hdPerHigherLevel + nExtraHitPoints
}
