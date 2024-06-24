const CONSTS = require('../../../consts')

/**
 * @description Damage is applied on all offending creatures : All creature attacking the attacker will take damage.
 * A saving throw against dragon breath is allowed
 * @var potency {number} a modifier added to saving throw difficulty
 *
 * @param oActionPayload {BFActionPayload}
 */
function main (oActionPayload) {
    const { attacker, attackOutcome, action, manager, data } = oActionPayload
    const {
        potency = 0
    } = data
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