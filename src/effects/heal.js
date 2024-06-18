const CONSTS = require('../consts')

/**
 *
 * @param effect {BFEffect}
 * @param target {Creature}
 */
function mutate ({ effect: oEffect, target }) {
    const { sum, min } = target.aggregateModifiers([
        CONSTS.EFFECT_AMPLIFY_HEALING,
        CONSTS.ITEM_PROPERTY_AMPLIFY_HEALING
    ])
    // If one single effect applies -100% this is a healing nullifier
    const nFactor = min <= -100 ? 0 : Math.max(0, 1 + sum / 100)
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
