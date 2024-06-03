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
 * @param manager {{}}
 * @param potency {number}
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
    data: {
        potency = 0
    }
}) {
    const sDamageType = attackOutcome.action.damageType
    manager
        .combatManager
        .getOffenders(attacker)
        .slice(0, 3)
        .forEach(oCreature => {
            const bSuccess = oCreature.rollSavingThrow(CONSTS.SAVING_THROW_DRAGON_BREATH, {
                adjustment: potency
            }).success
            const damage = action.damage
            if (!damage) {
                throw new Error('creature ' + attacker.name + ' - action ' + action.name + ' must specify damage value')
            }
            if (sDamageType === CONSTS.DAMAGE_TYPE_POISON) {
                if (!bSuccess) {
                    const eDamage = manager.createEffect(CONSTS.EFFECT_DAMAGE, damage, { damageType: sDamageType })
                    manager.applyEffect(eDamage, oCreature, manager.data.durations.DURATION_PERMANENT, attacker)
                }
            } else {
                let nDamage = oCreature.dice.evaluate(damage)
                if (bSuccess) {
                    nDamage = nDamage >> 1
                }
                const eDamage = manager.createEffect(CONSTS.EFFECT_DAMAGE, nDamage, { damageType: sDamageType })
                manager.applyEffect(eDamage, oCreature, manager.data.durations.DURATION_INSTANT, attacker)
            }
        })
}

module.exports = main