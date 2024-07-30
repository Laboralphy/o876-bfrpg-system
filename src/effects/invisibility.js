/**
 * Invisibility ends when taking hostile actions
 * @param effect
 * @param target
 * @param attackOutcome
 */
function attack ({ effect, target, attackOutcome }) {
    target.mutations.removeEffect({ effect })
}

module.exports = {
    attack
}