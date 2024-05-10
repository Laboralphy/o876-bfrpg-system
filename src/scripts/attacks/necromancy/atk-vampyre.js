const CONSTS = require('../../../consts')

/**
 * Effect:
 * This attack heals attacker, with an amount of hp equal to damage dealt by attack
 *
 * Saving throw:
 * None
 *
 * Data:
 * None
 *
 * Notes:
 * Often used on hit attack
 * Only living creature are affected
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
    if (target.getters.getSpecie.living) {
        const eHeal = manager.createEffect(CONSTS.EFFECT_HEAL, attackOutcome.damages.amount)
        manager.applyEffect(eHeal, attacker)
    }
}

module.exports = main