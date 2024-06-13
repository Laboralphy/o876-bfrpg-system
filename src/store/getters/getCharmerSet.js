const CONSTS = require("../../consts");
const {aggregateModifiers} = require("../../aggregator");

/**
 * Returns a set of creature ID that have charmed me
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @returns {Set<string>}
 */
module.exports = (state, getters) => {
    if (getters.getConditionSet.has(CONSTS.CONDITION_CHARMED)) {
        const { sorter } = aggregateModifiers([
            CONSTS.EFFECT_CHARM
        ], getters, {
            effectSorter: effect => effect.source // should be an ID
        })
        return new Set(Object.keys(sorter))
    } else {
        return new Set()
    }
}