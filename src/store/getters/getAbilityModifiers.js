const PickInputOutput = require('../../libs/pick-input-output')
const ObjectFusion = require('@laboralphy/object-fusion')
const {shallowMap} = require("@laboralphy/object-fusion");

/**
 * List of all ability modifiers
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {{}}
 * @returns {Object<string, number>}
 */
module.exports = (state, getters, externals) => {
    const p = new PickInputOutput(externals['ability-modifiers'], 'values', 'modifier')
    return shallowMap(getters.getAbilities, value => p.getValue(value))
}