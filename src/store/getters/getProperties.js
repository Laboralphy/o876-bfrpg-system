/**
 * Returns all items and innate properties applied to creature
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @returns {BFItemProperty[]}
 */
module.exports = (state, getters) => [
    ...state.properties,
    ...getters.getDefensiveEquipmentProperties,
    ...getters.getOffensiveEquipmentProperties
]
