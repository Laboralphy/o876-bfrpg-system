const CONSTS = require('../consts')

function create (oEffect, { amount }) {
    oEffect.amp = amount
}

function mutate ({ effect: oEffect, target }) {
    target.mutations.setHitPoints({ value: target.getters.getHitPoints + oEffect.amp })
}

module.exports = {
    create,
    mutate
}