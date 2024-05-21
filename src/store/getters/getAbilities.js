const CONSTS = require('../../consts')
const { aggregateModifiers } = require("../../aggregator");

/**
 * List of all ability modifiers
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @returns {Object<string, number>}
 */
module.exports = (state, getters) => {
    const { sorter } = aggregateModifiers([
            CONSTS.EFFECT_ABILITY_MODIFIER,
            CONSTS.ITEM_PROPERTY_ABILITY_MODIFIER
        ],
        getters,
        {
            effectSorter: effect => effect.data.ability,
            propSorter: prop => prop.data.ability
        }
    )
    return Object.fromEntries(Object
        .entries(state.abilities)
        .map(([sAbility, nValue]) => {
            const nModifier = (sAbility in sorter) ? sorter[sAbility].sum : 0
            return [sAbility, Math.max(1, nValue + nModifier)]
        })
    )
}
