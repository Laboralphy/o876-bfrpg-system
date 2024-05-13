const CONSTS = require('../../../consts')
const { durations: DURATIONS } = require('../../../data')

/**
 * This attack will apply CALM effect on target if saving throw against spell (mind spells) fails
 *
 * Saving throw:
 * Spells / mind spells
 *
 * Data:
 * - duration
 *
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
    manager,
    data: {
        duration = DURATIONS.DURATION_DEFAULT
    }
}) {
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_SPELL, { threat: CONSTS.THREAT_MIND_SPELL }).success) {
        const eDaze = manager.createEffect(CONSTS.EFFECT_DAZE)
        manager.applyEffect(eDaze, target, duration, attacker)
    }
}

module.exports = main