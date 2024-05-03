const CONSTS = require('../../consts')

/**
 * This attack drains hp from target to attacker (no save), must hit target
 *
 * @param turn {number}
 * @param tick {number}
 * @param attackOutcome {BFAttackOutcome}
 * @param attacker {Creature}
 * @param target {Creature}
 * @param action {BFStoreStateAction}
 * @param script {string}
 * @param damage {string|number}
 * @param manager {{}}
 * @param data {{}}
 */
function main ({
    turn,
    tick,
    attackOutcome,
    attacker,
    target,
    action,
    script,
    damage,
    manager,
    data
}) {
    if (attackOutcome.hit) {
        const eHeal = manager.createEffect(CONSTS.EFFECT_HEAL, attackOutcome.damages.amount)
        manager.applyEffect(eHeal, attacker)
    }
}

module.exports = main