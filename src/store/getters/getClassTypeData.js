const CONSTS = require('../../consts')

function getArrayValue (arr, index) {
    return arr[Math.min(arr.length, Math.max(1, index)) - 1]
}

function extractRegistryLevel (reg, nLevel) {
    return Object.fromEntries(
        Object.entries(reg).map(([key, arr]) => [key, getArrayValue(arr, nLevel)])
    )
}

/**
 *
 * @param state
 * @param getters
 * @param externals
 * @returns {{hitDieValue: number, hitPointBonus: number, maxHitDice: number, rogueSkills: Object<string, number[]>, savingThrows: Object<string, number[]>, attackBonus: number[]}}
 */
module.exports = (state, getters, externals) => {
    const data = externals['class-types'][state.classType]
    const nEffectiveLevel = getters.getLevel
    const nUndrainedLevel = Math.max(1, state.level)
    const bIsMonster = state.classType === CONSTS.CLASS_TYPE_MONSTER
    const oSavingThrows = bIsMonster
        ? externals['class-types'][state.monsterData.saveAs.classType]
        : data.savingThrows
    const nSavingThrowLevel = bIsMonster
        ? state.monsterData.saveAs.levelAdjust
        : nEffectiveLevel
    return {
        classType: state.classType,
        level: nEffectiveLevel,
        nextLevelExp: data.experienceLevels ? data.experienceLevels[nUndrainedLevel] : 0,
        hitDieValue: data.hitDieValue,
        hitPointBonus: data.hitPointBonus,
        maxHitDice: data.maxHitDice,
        attackBonus: getArrayValue(data.attackBonus, nEffectiveLevel),
        rogueSkills: data.rogueSkills
            ? extractRegistryLevel(data.rogueSkills, nEffectiveLevel)
            : null,
        savingThrows: extractRegistryLevel(oSavingThrows, nSavingThrowLevel)
    }
}