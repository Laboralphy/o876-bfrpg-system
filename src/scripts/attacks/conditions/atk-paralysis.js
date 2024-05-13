const CONSTS = require('../../../consts')
const { durations: DURATIONS } = require('../../../data')

/**
 * Effect:
 * This attack paralyzes target for a given duration,
 *
 * Saving throw:
 * A saving throw against paralysis is allowed
 * with STRENGTH adjustment
 *
 * Data:
 * - duration : duration of the effect (default 10)
 *
 * Note:
 * This attack is used by ghouls.
 *
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
    data: {
        duration = DURATIONS.DURATION_DEFAULT
    },
    manager
}) {
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_PARALYSIS_PETRIFY, { ability: CONSTS.ABILITY_STRENGTH }).success) {
        const eParalysis = manager.createEffect(CONSTS.EFFECT_PARALYSIS)
        eParalysis.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
        manager.applyEffect(eParalysis, target, attacker.dice.evaluate(duration), attacker)
    }
}

module.exports = main
