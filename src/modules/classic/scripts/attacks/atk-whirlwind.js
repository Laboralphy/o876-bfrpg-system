const CONSTS = require('../../../../consts')

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
    data
}) {
    manager
        .getOffenders(attacker)
        .forEach(oCreature => {
            const eDamage = manager.createEffect(CONSTS.EFFECT_DAMAGE, damage, { type: CONSTS.DAMAGE_TYPE_FORCE })
            manager.applyEffect(eDamage, oCreature, CONSTS.DURATION_INSTANT, attacker)
        })
}

module.exports = main