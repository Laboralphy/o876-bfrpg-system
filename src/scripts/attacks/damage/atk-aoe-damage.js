const CONSTS = require('../../../consts')

/**
 * Effect:
 * This attack deals damage to all creature creatures
 * Double damage to all flying creature
 *
 * Saving throw:
 * None
 *
 * Data:
 * - amount : damage dealt by this attack
 *
 * @param turn {number}
 * @param tick {number}
 * @param attackOutcome {BFAttackOutcome}
 * @param attacker {Creature}
 * @param target {Creature}
 * @param action {BFStoreStateAction}
 * @param script {string}
 * @param manager {{}}
 * @param data {object}
 */
function main ({
    turn,
    tick,
    attackOutcome,
    attacker,
    target,
    action,
    script,
    manager,
    data
}) {
    const sDamageType = attackOutcome.action.damageType
    manager
        .getOffenders(attacker)
        .forEach(oCreature => {
            const eDamage = manager.createEffect(CONSTS.EFFECT_DAMAGE, action.damage, { type: sDamageType })
            manager.applyEffect(eDamage, oCreature, manager.data.durations.DURATION_INSTANT, attacker)
        })
}

module.exports = main