function mutate ({ effect: oEffect, target }) {
    target.mutations.setHitPoints({ value: target.getters.getHitPoints + oEffect.amp })
}

module.exports = {
    mutate
}