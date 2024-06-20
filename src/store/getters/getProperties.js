/**
 * Returns all items and innate properties applied to creature
 * items property does not include those conveyed by un-equipped weapons
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @returns {BFItemProperty[]}
 */
module.exports = (state, getters) => [
    ...state.properties.slice(0),
    ...getters.getRace.properties,
    ...getters.getDefensiveEquipmentProperties,
    ...getters.getOffensiveEquipmentProperties
]
