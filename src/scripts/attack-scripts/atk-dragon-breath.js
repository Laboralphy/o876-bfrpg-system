const CONSTS = require('../../consts')

/**
 * This attack don't need hit.
 * A saving throw against dragon breath is allowed for half damage
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
    const sDamageType = attackOutcome.action.damageType
    if (!sDamageType) {
        throw new Error('dragon breath requires damage type in action definition')
    }
    manager
        .getOffenders(attacker)
        .forEach(oCreature => {
            let nDamage = oCreature.dice.evaluate(damage)
            const bSuccess = oCreature.rollSavingThrow(CONSTS.SAVING_THROW_DRAGON_BREATH).success
            if (bSuccess) {
                nDamage = nDamage >> 1
            }
            const eDamage = manager.createEffect(CONSTS.EFFECT_DAMAGE, nDamage, { type: sDamageType })
            manager.applyEffect(eDamage, oCreature, CONSTS.DURATION_INSTANT, attacker)
        })
}

module.exports = main