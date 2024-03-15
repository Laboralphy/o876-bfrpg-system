const CONSTS = require('../../consts')

/**
 * Return minimum numeric value of array.
 * If array is empty, returns undefined
 * @param array {number[]}
 * @returns {number|undefined}
 */
function getMinNumArray (array) {
    if (array.length === 0) {
        return undefined
    }
    return array.reduce((prev, curr) => Math.min(prev, curr), array[0])
}

/**
 * Return maximum numeric value of array.
 * If array is empty, returns undefined
 * @param array {number[]}
 * @returns {number|undefined}
 */
function getMaxNumArray (array) {
    if (array.length === 0) {
        return undefined
    }
    return array.reduce((prev, curr) => Math.max(prev, curr), array[0])
}

function getMinAbilityValue (data) {
    return data
        .reduce((prev, { values }) => Math.min(prev, getMinNumArray(values)), Infinity)
}

function getMaxAbilityValue (data) {
    return data
        .reduce((prev, { values }) => Math.max(prev, getMaxNumArray(values)), -Infinity)
}

function getMinModifier (data) {
    return getMinNumArray(data.map(({ modifier }) => modifier))
}

function getMaxModifier (data) {
    return getMaxNumArray(data.map(({ modifier }) => modifier))
}
/**
 * List of all ability modifiers
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {{}}
 * @returns {Object<string, number>}
 */
module.exports = (state, getters, externals) => {
    const modifiers = externals['ability-modifiers']
    const nMinAbility = getMinAbilityValue(modifiers)
    const nMaxAbility = getMaxAbilityValue(modifiers)
    const nMinModifier = getMinModifier(modifiers) || 0
    const nMaxModifier = getMaxModifier(modifiers) || 0
    const oAbilities = getters.getAbilities
    return Object.fromEntries(Object
        .entries(oAbilities)
        .map(([ability, value]) => {
            if (value < nMinAbility) {
                return [ability, nMinModifier]
            }
            if (value > nMaxAbility) {
                return [ability, nMaxModifier]
            }
            const m = modifiers
                .find(({ values }) => values.includes(value))
            const modifier = m === undefined ? undefined : m.modifier
            if (modifier !== undefined) {
                return [ability, modifier]
            } else {
                throw new RangeError(`The value ${value} of this ability ${ability} has no valid modifier`)
            }
        }))
}