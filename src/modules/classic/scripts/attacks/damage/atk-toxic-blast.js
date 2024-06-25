const CONSTS = require('../../../../../consts')

/**
 * @description Deals poison damage to all offenders. A successful saving throw against poison halves damages.
 * The amount of damage is defined in the action damage property.
 *
 * @param oActionPayload {BFActionPayload}
 */
function main (oActionPayload) {
    const {
        attacker,
        damage,
        manager
    } = oActionPayload
    manager
        .getOffenders(attacker)
        .forEach(oCreature => {
            let nDamage = oCreature.dice.evaluate(damage)
            const bSuccess = oCreature.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON).success
            if (bSuccess) {
                nDamage = nDamage >> 1
            }
            const eDamage = manager.createEffect(CONSTS.EFFECT_DAMAGE, nDamage, { damageType: CONSTS.DAMAGE_TYPE_POISON })
            manager.applyEffect(eDamage, oCreature, manager.data['durations'].DURATION_INSTANT, attacker)
        })
}

module.exports = main