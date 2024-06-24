const CONSTS = require('../consts')

/**
 *
 * @param effect {BFEffect}
 * @param target {Creature}
 */
function mutate ({ effect: oEffect, target }) {
    let nFactor = 1
    const f = ({ amp }) => {
        nFactor *= amp
    }
    target.aggregateModifiers([
        CONSTS.EFFECT_HEALING_FACTOR,
        CONSTS.ITEM_PROPERTY_HEALING_FACTOR
    ], {
        propForEach: f,
        effectForEach: f
    })
    // If one single effect applies -100% this is a healing nullifier
    const nHealAmount = oEffect.amp
    const nHealAmountAmplified = Math.floor(nHealAmount * nFactor)
    target.setHitPoints(target.getters.getHitPoints + nHealAmountAmplified)
    target.events.emit('heal', {
        amount: nHealAmountAmplified,
        factor: nFactor,
        baseAmount: nHealAmount
    })
}

module.exports = {
    mutate
}
