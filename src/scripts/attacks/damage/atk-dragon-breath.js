const CONSTS = require('../../../consts')

/**
 * Effect:
 * Damage on all offending creatures : All creature attacking the attacker will take damage.
 *
 * Saving throw:
 * A saving throw against dragon breath is allowed for half damage
 *
 * Data:
 * None
 *
 * Note:
 * The damage amount and type is fixed by the attack parameters.
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
    data: {
        potency = 0
    }
}) {
    const sDamageType = attackOutcome.action.damageType
    manager
        .getOffenders(attacker)
        .forEach(oCreature => {
            let nDamage = oCreature.dice.evaluate(damage)
            const bSuccess = oCreature.rollSavingThrow(CONSTS.SAVING_THROW_DRAGON_BREATH, {
                adjustment: potency
            }).success
            if (bSuccess) {
                nDamage = nDamage >> 1
            }
            const eDamage = manager.createEffect(CONSTS.EFFECT_DAMAGE, nDamage, { type: sDamageType })
            manager.applyEffect(eDamage, oCreature, manager.data.durations.DURATION_INSTANT, attacker)
        })
}

module.exports = main