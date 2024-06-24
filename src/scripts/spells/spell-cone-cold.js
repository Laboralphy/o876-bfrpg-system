const CONSTS = require('../../consts')

/**
 * @description This spell does 1d6 cold damage per caster level to up to 3 offenders.
 * A saving throw against spell is allowed for half damage
 */
function main (oActionPayload) {
    const { attacker, target, manager } = oActionPayload
    manager
        .combatManager
        .getOffenders(attacker)
        .slice(0, 3)
        .forEach(oCreature => {
            const nCasterLevel = attacker.getters.getLevel
            const bSuccess = oCreature.rollSavingThrow(CONSTS.SAVING_THROW_SPELL).success
            const nDamage = attacker.dice.roll(6, nCasterLevel)
            const eDamage = manager.createEffect(
                CONSTS.EFFECT_DAMAGE,
                bSuccess ? nDamage >> 1 : nDamage,
                {
                    damageType: CONSTS.DAMAGE_TYPE_COLD
                }
            )
            manager.applyEffect(eDamage, target, 0, attacker)
            if (!bSuccess) {
                const eStun = manager.createEffect(CONSTS.EFFECT_STUN)
                manager.applyEffect(eStun, target, 2, attacker)
            }
        })
}

module.exports = main