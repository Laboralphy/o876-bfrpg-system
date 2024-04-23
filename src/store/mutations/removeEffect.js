/**
 * @param state {BFStoreState}
 * @param effect {BFEffect}
 */
module.exports = ({ state }, { effect }) => {
    const oEffect = state.effects.find(eff => eff.id === effect.id)
    if (oEffect) {
        oEffect.duration = 0
    }
}