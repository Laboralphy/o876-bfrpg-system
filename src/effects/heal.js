const CONSTS = require('../consts')

/**
 *
 * @param oEffect {BFEffect}
 * @param target {Creature}
 */
function mutate ({ effect: oEffect, target }) {
    const { sum, min } = target.aggregateModifiers([
        CONSTS.EFFECT_AMPLIFY_HEALING,
        CONSTS.ITEM_PROPERTY_AMPLIFY_HEALING
    ])
    // If one single effect applies -100% this is a healing nullifier
    const nFactor = min <= -100 ? 0 : Math.max(0, 1 + sum / 100)
    target.mutations.setHitPoints({ value: target.getters.getHitPoints + Math.floor(oEffect.amp * nFactor) })
}

module.exports = {
    mutate
}
