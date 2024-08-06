const CONSTS = require('../consts')

/**
 * Stealth ends when taking hostile actions
 * Stealth is just like invisibility, but cannot be detected by EFFECT_SEE_INVISIBILITY
 * @param effect {BFEffect}
 */
function init ({ effect }) {
    effect.stackingRule = CONSTS.EFFECT_STACKING_RULE_NO_STACK
}

/**
 * @param effect
 * @param target
 * @param attackOutcome
 */
function attack ({ effect, attackOutcome }) {
    attackOutcome.attacker.mutations.removeEffect({ effect })
}

module.exports = {
    attack,
    init
}
