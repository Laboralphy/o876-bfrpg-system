/**
 * Change an effect duration. Setting duration to 0 will remove effect from creatures
 * @param state {BFStoreState}
 * @param effect {BFEffect}
 * @param duration {number}
 */
module.exports = ({ state }, { effect, duration }) => {
    const oEffect = state.effects.find(e => e.id === effect.id)
    if (oEffect) {
        oEffect.duration = duration
    } else {
        throw new Error(`effect ${effect.id} not found.`)
    }
}