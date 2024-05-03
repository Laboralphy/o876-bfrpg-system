const CONSTS = require('../../consts')

/**
 * This attack don't need hit.
 * A saving throw against death ray is allowed for half damage
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
            const eDamage = manager.createEffect(CONSTS.EFFECT_DAMAGE, nDamage)
            eDamage.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
            manager.applyEffect(eDamage, oCreature, CONSTS.DURATION_INSTANT, attacker)
        })
}

module.exports = main