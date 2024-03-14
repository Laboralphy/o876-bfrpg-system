const CONSTS = require('../consts')

function create (oEffect, { amount }) {
    oEffect.type = CONSTS.EFFECT_HEAL
    oEffect.amp = amount
}

function mutate ({ effect: oEffect, target }) {
    target.store.mutations.setHitPoints({ value: target.store.getters.getHitPoints + oEffect.amp })
}

module.exports = {
    create,
    mutate
}