const CONSTS = require('../../../../consts')
const { durations: DURATIONS } = require('../../../../data')

/**
 * Effect:
 * This attack deals damage to all non-flying creatures
 *
 * Saving throw:
 * None
 *
 * Data:
 * - amount : damage dealt by this attack, this damage is lower than main damage dealt to target.
 *
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
 * @param amount {number}
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
    data: {
        amount
    }
}) {
    manager
        .getOffenders(attacker)
        .filter(oCreature => target !== oCreature)
        .forEach(oCreature => {
            const eDamage = manager.createEffect(CONSTS.EFFECT_DAMAGE, amount, { type: CONSTS.DAMAGE_TYPE_FORCE })
            manager.applyEffect(eDamage, oCreature, DURATIONS.DURATION_INSTANT, attacker)
        })
}

module.exports = main