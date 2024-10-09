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
 * @returns {{hdPerLowerLevel: number, hdPerHigherLevel: number, lowerLevelCount: number, rogueSkills: Object<string, number>, savingThrows: Object<string, number>, attackBonus: number}}
 */
module.exports = (state, getters, externals) => {
    const data = externals['class-types'][state.classType]
    if (!data) {
        throw new Error('no data for class type ' + state.classType)
    }
    const raceData = getters.getRace
    const nEffectiveLevel = getters.getLevel
    const xpl = data.experienceLevels
    const bHasLevels = Array.isArray(xpl)
    const nMaxLevel = bHasLevels ? xpl.length : Infinity
    const nUndrainedLevel = Math.max(1, state.level)
    const bIsMonster = state.classType === CONSTS.CLASS_TYPE_MONSTER
    const oSavingThrows = bIsMonster
        ? externals['class-types'][state.classType].savingThrows
        : data.savingThrows
    /**
     * @type {{[p: string]: number}}
     */
    const rogueSkills = data.rogueSkills
        ? extractRegistryLevel(data.rogueSkills, nEffectiveLevel)
        : {
            [CONSTS.SKILL_OPEN_LOCK]: 0,
            [CONSTS.SKILL_REMOVE_TRAP]: 0,
            [CONSTS.SKILL_PICK_POCKET]: 0,
            [CONSTS.SKILL_MOVE_SILENTLY]: 0,
            [CONSTS.SKILL_CLIMB_WALL]: 0,
            [CONSTS.SKILL_HIDE]: 0,
            [CONSTS.SKILL_LISTEN]: 0
        }
    Object
        .entries(raceData.rogueSkills)
        /**
         * @param skill {string}
         * @param value {number}
         */
        .forEach(([skill, value]) => {
            rogueSkills[skill] = Math.max(rogueSkills[skill], value)
        })
    return {
        ref: state.classType,
        level: nEffectiveLevel,
        undrainedLevel: nUndrainedLevel,
        maxLevel: nMaxLevel,
        nextLevelExp: bHasLevels && nUndrainedLevel < nMaxLevel ? xpl[nUndrainedLevel] : Infinity,
        hdPerLowerLevel: data.hdPerLowerLevel,
        hdPerHigherLevel: data.hdPerHigherLevel,
        lowerLevelCount: data.lowerLevelCount,
        attackBonus: getArrayValue(data.attackBonus, nEffectiveLevel),
        rogueSkills,
        savingThrows: extractRegistryLevel(oSavingThrows, nEffectiveLevel)
    }
}