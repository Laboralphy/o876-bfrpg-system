const CONSTS = require('../../../consts')
const { durations: DURATIONS } = require('../../../data')

/**
 * This attack poisons target for an unlimited duration, dealing a small amount of damage each turn.
 *
 * Saving throw
 * saving against poison is allowed for avoidance.
 *
 * Data:
 * - potency : The potency is specified in data (default 0)
 * - amount : The amount of damage is specified in data (default 1)
 *
 * Notes:
 * None
 *
 * @param turn {number}
 * @param tick {number}
 * @param attackOutcome {BFAttackOutcome}
 * @param attacker {Creature}
 * @param target {Creature}
 * @param action {BFStoreStateAction}
 * @param script {string}
 * @param manager {{}}
 * @param damage {string|number}
 * @param potency {number} saving throw adjustement
 * @param amount {string|number}
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
       potency = 0,
       amount = 1
   },
   manager
}) {
    // if saving throw against poison fail then apply poison
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON, { adjustment: potency, threat: CONSTS.THREAT_POISON }).success) {
        const ePoison = manager.createEffect(CONSTS.EFFECT_DAMAGE, amount, {
            type: CONSTS.DAMAGE_TYPE_POISON
        })
        ePoison.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
        manager.applyEffect(ePoison, target, DURATIONS.DURATION_PERMANENT, attacker)
    }
}

module.exports = main