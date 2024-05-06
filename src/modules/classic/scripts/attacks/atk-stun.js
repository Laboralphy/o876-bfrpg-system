const CONSTS = require('../../../../consts')

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
        duration = CONSTS.DURATION_DEFAULT
    },
    manager
}) {
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON).success) {
        const eDaze = manager.createEffect(CONSTS.EFFECT_STUN)
        eDaze.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
        manager.applyEffect(eDaze, target, duration, attacker)
    }
}

module.exports = main
