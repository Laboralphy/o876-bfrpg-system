const CONSTS = require('../../consts')
const { aggregateModifiers } = require('../../aggregator')

/**
 * Returns a Set containing all immunities
 *
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @returns {Set<string>}
 */
module.exports = (state, getters) => {
    const { sorter: oImmunities } = aggregateModifiers([
        CONSTS.EFFECT_IMMUNITY,
        CONSTS.ITEM_PROPERTY_IMMUNITY
    ], getters, {
        effectSorter: effect => effect.data.immunityType,
        propSorter: prop => prop.data.immunityType
    })
    return new Set(Object.keys(oImmunities))
}
