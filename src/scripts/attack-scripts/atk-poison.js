const CONSTS = require('../../consts')

/**
 * This attack poisons target for an unlimited duration, if target fails at saving against poison
 * @param turn {number}
 * @param tick {number}
 * @param attackOutcome {BFAttackOutcome}
 * @param attacker {Creature}
 * @param target {Creature}
 * @param action {BFStoreStateAction}
 * @param script {string}
 * @param damage {string|number}
 * @param power {number} saving throw adjustement
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
       power = 0
   },
   manager
}) {
    // if saving throw against poison fail then apply poison
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON, { adjustment: power, threat: CONSTS.THREAT_POISON }).success) {
        const ePoison = manager.createEffect(CONSTS.EFFECT_DAMAGE, '1d3', {
            type: CONSTS.DAMAGE_TYPE_POISON
        })
        ePoison.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
        manager.applyEffect(ePoison, target, Infinity, attacker)
    }
}

module.exports = main