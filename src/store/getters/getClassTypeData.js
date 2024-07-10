const CONSTS = require('../../consts')
const {shallowMap} = require("@laboralphy/object-fusion");

function getArrayValue (arr, index) {
    const value = arr[Math.min(arr.length, Math.max(1, index)) - 1]
    if (value === undefined) {
        console.error(arr, index)
        throw new Error('extracted value is undefined')
    }
    return value
}

function extractRegistryLevel (reg, nLevel) {
    return shallowMap(reg, arr => getArrayValue(arr, nLevel))
}

/**
 *
 * @param state
 * @param getters
 * @param externals
 * @returns {{hdPerLowerLevel: number, hdPerHigherLevel: number, lowerLevelCount: number, rogueSkills: Object<string, number[]>, savingThrows: Object<string, number[]>, attackBonus: number[]}}
 */
module.exports = (state, getters, externals) => {
    const data = externals['class-types'][state.classType]
    const nEffectiveLevel = getters.getLevel
    const xpl = data.experienceLevels
    const bHasLevels = Array.isArray(xpl)
    const nMaxLevel = bHasLevels ? xpl.length : Infinity
    const nUndrainedLevel = Math.max(1, state.level)
    const bIsMonster = state.classType === CONSTS.CLASS_TYPE_MONSTER
    const oSavingThrows = bIsMonster
        ? externals['class-types'][state.classType].savingThrows
        : data.savingThrows
    return {
        ref: state.classType,
        level: nEffectiveLevel,
        maxLevel: nMaxLevel,
        nextLevelExp: bHasLevels && nUndrainedLevel < nMaxLevel ? xpl[nUndrainedLevel] : Infinity,
        hdPerLowerLevel: data.hdPerLowerLevel,
        hdPerHigherLevel: data.hdPerHigherLevel,
        lowerLevelCount: data.lowerLevelCount,
        attackBonus: getArrayValue(data.attackBonus, nEffectiveLevel),
        rogueSkills: data.rogueSkills
            ? extractRegistryLevel(data.rogueSkills, nEffectiveLevel)
            : null,
        savingThrows: extractRegistryLevel(oSavingThrows, nEffectiveLevel)
    }
}