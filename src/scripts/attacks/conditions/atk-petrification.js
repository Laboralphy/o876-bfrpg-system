const CONSTS = require('../../../consts')
const { durations: DURATIONS } = require('../../../data')

/**
 * Effect:
 * This attack petrifies target
 *
 * Saving throw:
 * target must roll against petrification with no ability adjustment
 *
 * Data:
 * None
 *
 * Note:
 * The duration is always Infinite
 *
 * @param turn {number}
 * @param tick {number}
 * @param attackOutcome {BFAttackOutcome}
 * @param attacker {Creature}
 * @param target {Creature}
 * @param action {BFStoreStateAction}
 * @param script {string}
 * @param damage {string|number}
 * @param data {{}}
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
    data,
    manager
}) {
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_PARALYSIS_PETRIFY).success) {
        const ePetrify = manager.createEffect(CONSTS.EFFECT_PETRIFICATION)
        ePetrify.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
        manager.applyEffect(ePetrify, target, DURATIONS.DURATION_PERMANENT, attacker)
    }
}

module.exports = main
