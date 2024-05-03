const CONSTS = require('../../consts')

/**
 * This attack poisons target for an unlimited duration, if target fails at saving against poison.
 * The potency is specified in data (default 0)
 * The amount of damage is specified in data (default 1)
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
   damage,
   data: {
       potency = 0,
       amount = 1
   },
   manager
}) {
    // if saving throw against poison fail then apply poison
    if (attackOutcome.hit && !target.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON, { adjustment: potency, threat: CONSTS.THREAT_POISON }).success) {
        const ePoison = manager.createEffect(CONSTS.EFFECT_DAMAGE, amount, {
            type: CONSTS.DAMAGE_TYPE_POISON
        })
        ePoison.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
        manager.applyEffect(ePoison, target, CONSTS.DURATION_PERMANENT, attacker)
    }
}

module.exports = main