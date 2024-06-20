const ArrayMutations = require('../../libs/array-mutations')

/**
 *
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param data {*}
 */
module.exports = ({ state, getters }, { data }) => {
    state.abilities = data.abilities
    state.classType = data.classType
    state.specie = data.specie
    state.speed = data.speed
    state.race = data.race
    state.naturalArmorClass = data.naturalArmorClass
    state.level = data.level
    state.actions = data.actions
    state.selectedAction = data.selectedAction
    state.gauges = data.gauges
    ArrayMutations.update(state.effects, data.effects)
    ArrayMutations.update(state.properties, data.properties)
    state.offensiveSlot = data.offensiveSlot
    state.equipment = data.equipment
    state.encumbrance = data.encumbrance
}
