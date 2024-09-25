/**
 *
 * @param target {Creature}
 */
function mutate ({ target }) {
    target.revive()
}

module.exports = {
    mutate
}