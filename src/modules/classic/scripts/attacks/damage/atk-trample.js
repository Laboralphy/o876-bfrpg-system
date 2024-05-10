const CONSTS = require('../../../../../consts')
const DATA = require('../../../../../data')

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
        .getOffenders(attacker, DATA["weapon-ranges"].WEAPON_RANGE_MELEE)
        .forEach(oCreature => {
            const eDamage = manager.createEffect(CONSTS.EFFECT_DAMAGE, action.damage, { type: sDamageType })
            manager.applyEffect(eDamage, oCreature, manager.data.durations.DURATION_INSTANT, attacker)
        })
}

module.exports = main
