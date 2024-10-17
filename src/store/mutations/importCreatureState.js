const ArrayMutations = require('../../libs/array-mutations')

/**
 *
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param data {*}
 */
module.exports = ({ state, getters }, { data }) => {
    state.id = data.id
    state.abilities = data.abilities
    state.classType = data.classType
    state.specie = data.specie
    state.speed = data.speed
    state.race = data.race
    state.naturalArmorClass = data.naturalArmorClass
    state.level = data.level
    state.actions = data.actions
    state.gender = data.gender
    state.selectedAction = data.selectedAction
    state.pools = data.pools
    ArrayMutations.update(state.effects, data.effects)
    ArrayMutations.update(state.properties, data.properties)
    state.offensiveSlot = data.offensiveSlot
    state.equipment = data.equipment
    state.encumbrance = data.encumbrance
}
