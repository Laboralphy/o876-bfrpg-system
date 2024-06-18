const PickInputOutput = require('../../libs/pick-input-output')

/**
 * List of all ability modifiers
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {{}}
 * @returns {Object<string, number>}
 */
module.exports = (state, getters, externals) => {
    const p = new PickInputOutput(externals['ability-modifiers'], 'values', 'modifier')
    return Object.fromEntries(Object
        .entries(getters.getAbilities)
        .map(([ability, value]) => [ability, p.getValue(value)]))
}