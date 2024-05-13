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
 * @param attackOutcome {BFAttackOutcome}
 * @param attacker {Creature}
 * @param target {Creature}
 * @param action {BFStoreStateAction}
 * @param manager {{}}
 * @param data {object}
 */
function main ({
    attackOutcome,
    attacker,
    target,
    action,
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