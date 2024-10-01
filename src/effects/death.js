/**
 *
 * @param target {Creature}
 * @param source {Creature}
 */
function mutate ({ target, source }) {
    // will drop hp to 0
    target.setHitPoints(0)
    target.events.emit('death', {
        creature: target,
        killer: source
    })
}

module.exports = {
    mutate
}