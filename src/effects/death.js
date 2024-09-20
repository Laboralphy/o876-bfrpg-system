/**
 *
 * @param effect {BFEffect}
 * @param target {Creature}
 */
function mutate ({ effect, target }) {
    // will drop hp to 0
    target.mutations.setHitPoints({ value: 0 })
}

module.exports = {
    mutate
}