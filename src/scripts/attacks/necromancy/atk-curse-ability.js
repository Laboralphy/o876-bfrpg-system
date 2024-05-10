const CONSTS = require('../../../consts')
const { durations: DURATIONS } = require('../../../data')

/**
 * Effect:
 * This attack damages an ability.
 *
 * Saving throw:
 * A saving throw against death ray is allowed.
 * No ability bonus.
 *
 * Data:
 * - ability : (required) the ability that will be damaged
 * - amount : The amount of points of damage. (default 1)
 * - duration : The curse duration (default permanent)
 *
 * Notes:
 * - Works on living creature only.
 * - The effect is supernatural : cannot be dispelled or removed by resting.
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
 * @param ability {string} ability to be damaged
 * @param amount {number} amount of ability points
 * @param duration {number} if no duration then : infinity
 */
function main ({
    turn,
    tick,
    attackOutcome,
    attacker,
    target,
    action,
    script,
    manager,
    data: {
       ability,
       amount = 1,
       duration = DURATIONS.DURATION_PERMANENT
    }
}) {
    if (target.getters.getSpecie.living && !target.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON).success) {
        const eCurse = manager.createEffect(CONSTS.EFFECT_ABILITY_MODIFIER, amount, { ability })
        eCurse.subtype = CONSTS.EFFECT_SUBTYPE_SUPERNATURAL
        manager.applyEffect(eCurse, target, duration, attacker)
    }
}

module.exports = main