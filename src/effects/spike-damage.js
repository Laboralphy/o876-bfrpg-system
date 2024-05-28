const CONSTS = require("../consts");

function init (oEffect, { damageType: sDamageType = CONSTS.DAMAGE_TYPE_PHYSICAL, maxDistance = Infinity, savingThrow = false }) {
    oEffect.data.damageType = sDamageType
    oEffect.data.savingThrow = savingThrow
    oEffect.data.maxDistance = maxDistance
}

function attacked ({ effectProcessor, effect: { amp, data }, attackOutcome }) {
    if (attackOutcome.distance > data.maxDistance) {
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
    init,
    attacked
}