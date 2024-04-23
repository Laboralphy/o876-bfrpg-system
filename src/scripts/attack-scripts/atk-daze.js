const CONSTS = require('../../consts')

function main ({
    turn,
    tick,
    attackOutcome,
    attacker,
    target,
    action,
    script,
    damage,
    data: {
        duration
    },
    manager
}) {
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON).success) {
        const eDaze = manager.effectProcessor.createEffect(CONSTS.EFFECT_STUN)
        eDaze.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
        manager.effectProcessor.applyEffect(eDaze, target, duration, attacker)
    }
}

module.exports = main