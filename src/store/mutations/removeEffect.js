/**
 * @param state {BFStoreState}
 * @param effect {BFEffect}
 */
module.exports = ({ state }, { effect }) => {
    const oEffect = state.effects.find(eff => eff.id === effect.id)
    if (oEffect) {
        oEffect.duration = 0
    } else {
        throw new Error('This effect ' + effect.id + ' is not hosted by this creature')
    }
}