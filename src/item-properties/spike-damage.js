const CONSTS = require('../consts')

function init (oItemProperty, { damageType: sDamageType = CONSTS.DAMAGE_TYPE_PHYSICAL, savingThrow = false }) {
    oItemProperty.data.type = sDamageType
    oItemProperty.data.savingThrow = savingThrow
}

function attacked ({ amp, data }, { manager, attackOutcome }) {
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
    const eDamage = manager.createEffect(CONSTS.EFFECT_DAMAGE, amp, {
        type: data.damageType
    })
    manager.applyEffect(eDamage, attacker, 0, target)
}

module.exports = {
    init
}
