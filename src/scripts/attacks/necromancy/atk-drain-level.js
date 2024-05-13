const CONSTS = require('../../../consts')
const { durations: DURATIONS } = require('../../../data')

/**
 * Effect:
 * This attack adds negative level.
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
        amount = 1,
        duration = DURATIONS.DURATION_PERMANENT,
        potency = 0
    }
}) {
    if (target.getters.getSpecie.living && !target.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON, { adjustment: potency }).success) {
        const eDrain = manager.createEffect(CONSTS.EFFECT_NEGATIVE_LEVEL, attacker.dice.evaluate(amount))
        eDrain.subtype = CONSTS.EFFECT_SUBTYPE_SUPERNATURAL
        manager.applyEffect(eDrain, target, attacker.dice.evaluate(duration), attacker)
    }
}

module.exports = main