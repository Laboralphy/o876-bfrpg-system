const CONSTS = require('../../consts')

/**
 * Attack script
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
                   damage,
                   data: {
                       power = 0
                   },
                   manager
               }) {
    // if saving throw against poison fail then apply poison
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON, power).success) {
        const ePoison = manager.effectProcessor.createEffect(CONSTS.EFFECT_DAMAGE, '1d3', {
            type: CONSTS.DAMAGE_TYPE_POISON
        })
        ePoison.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
        manager.effectProcessor.applyEffect(ePoison, target, Infinity, attacker)
    }
}

module.exports = main