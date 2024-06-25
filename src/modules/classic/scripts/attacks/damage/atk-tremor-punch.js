const CONSTS = require('../../../../../consts')

/**
 * @description This attack deals damage to all non-flying creatures, no saving throw allowed.
 *
 * @param oActionPayload {BFActionPayload}
 */
function main (oActionPayload) {
    const {
        attacker,
        target,
        manager,
        damage
    } = oActionPayload
    manager
        .getOffenders(attacker)
        .filter(oCreature => target !== oCreature)
        .forEach(oCreature => {
            const eDamage = manager.createEffect(CONSTS.EFFECT_DAMAGE, attacker.dice.evaluate(damage), { damageType: CONSTS.DAMAGE_TYPE_FORCE })
            manager.applyEffect(eDamage, oCreature, manager.data['durations'].DURATION_INSTANT, attacker)
        })
}

module.exports = main