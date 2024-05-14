const CONSTS = require('../../../../../consts')
const { durations: DURATIONS } = require('../../../../../data')

/**
 * Effect:
 * Deal damage on all offenders
 *
 * Saving throw:
 * Save against POISON for half damage
 *
 * Data:
 * None
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
    manager
        .getOffenders(attacker)
        .forEach(oCreature => {
            let nDamage = oCreature.dice.evaluate(damage)
            const bSuccess = oCreature.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON).success
            if (bSuccess) {
                nDamage = nDamage >> 1
            }
            const eDamage = manager.createEffect(CONSTS.EFFECT_DAMAGE, nDamage, { type: CONSTS.DAMAGE_TYPE_POISON })
            manager.applyEffect(eDamage, oCreature, DURATIONS.DURATION_INSTANT, attacker)
        })
}

module.exports = main