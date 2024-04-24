const CONSTS = require('../../consts')

/**
 * This attack paralyzes target for a given duration
 * @param turn {number}
 * @param tick {number}
 * @param attackOutcome {BFAttackOutcome}
 * @param attacker {Creature}
 * @param target {Creature}
 * @param action {BFStoreStateAction}
 * @param script {string}
 * @param damage {string|number}
 * @param duration {number}
 * @param manager {{}}
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
    data: {
        duration
    },
    manager
}) {
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_PARALYSIS_PETRIFY).success) {
        const eParalysis = manager.effectProcessor.createEffect(CONSTS.EFFECT_PARALYSIS)
        eParalysis.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
        manager.effectProcessor.applyEffect(eParalysis, target, duration, attacker)
    }
}

module.exports = main
