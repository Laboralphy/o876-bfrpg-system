/**
 *
 * @param target {Creature}
 */
function mutate ({ target }) {
    // will drop hp to 0
    target.setHitPoints(0)
}

module.exports = {
    mutate
}