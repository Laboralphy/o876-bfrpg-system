const CONSTS = require("../../consts");

/**
 *
 * @param effectProcessor {EffectProcessor}
 * @param attackOutcome {BFAttackOutcome}
 * @param amp {number|string}
 * @param data {{}}
 */
function onAttacked (effectProcessor, attackOutcome, amp, data) {
    if (!attackOutcome.hit || attackOutcome.damages.amount <= 0 || attackOutcome.distance > data.maxDistance) {
        return
    }
    const {
        attacker,
        target
    } = attackOutcome
    // check saving throw
    if (data.savingThrow && attacker.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON).success) {
        return
    }
    // The attacker will take damage
    const eDamage = effectProcessor.createEffect(CONSTS.EFFECT_DAMAGE, amp, {
        damageType: data.damageType
    })
    effectProcessor.applyEffect(eDamage, attacker, 0, target)
}

module.exports = {
    onAttacked
}