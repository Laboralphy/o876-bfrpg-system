const CONSTS = require('../../../consts')
const { duration: DURATIONS } = require('../../../data')

/**
 * Attack script
 * @param turn {number}
 * @param tick {number}
 * @param attackOutcome {BFAttackOutcome}
 * @param attacker {Creature}
 * @param target {Creature}
 * @param action {BFStoreStateAction}
 * @param script {string}
 * @param damage {string|number}
 * @param manager {{}}
 * @param duration {{}}
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
    data: {
        duration = DURATIONS.DURATION_DEFAULT
    }
}) {
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_SPELL, { threat: CONSTS.THREAT_MIND_SPELL }).success) {
        const eCharm = manager.createEffect(CONSTS.EFFECT_CHARM)
        manager.applyEffect(eCharm, target, duration, attacker)
    }
}

module.exports = main