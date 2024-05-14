const CONSTS = require('../../../consts')
const { durations: DURATIONS } = require('../../../data')

/**
 * Effect:
 * apply EFFECT_STUN on target
 *
 * Saving throw:
 * Avoided if saving throw against Death ray
 *
 * Data:
 * - duration : specified in data
 *
 * @param turn {number}
 * @param tick {number}
 * @param attackOutcome {BFAttackOutcome}
 * @param attacker {Creature}
 * @param target {Creature}
 * @param action {BFStoreStateAction}
 * @param script {string}
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
    data: {
        duration = DURATIONS.DURATION_DEFAULT,
        potency = 0
    },
    manager
}) {
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON, {
        adjustment: potency
    }).success) {
        const eStun = manager.createEffect(CONSTS.EFFECT_STUN)
        eStun.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
        manager.applyEffect(eStun, target, attacker.dice.evaluate(duration), attacker)
    }
}

module.exports = main
