const CONSTS = require('../../../../consts')

/**
 * Effect:
 * This attack lowers attack bonus by 2.
 *
 * Saving throw:
 * None
 *
 * Data:
 * - duration: duration of the affliction.
 *
 * Notes:
 * - cannot be stacked : several sources of distraction will not stack
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
    const eAtkMalus = manager.createEffect(CONSTS.EFFECT_ATTACK_MODIFIER, -2)
    const eSTMalus = manager.createEffect(CONSTS.EFFECT_SAVING_THROW_MODIFIER, -2)
    eAtkMalus.stackingRule = CONSTS.EFFECT_STACKING_RULE_UPDATE_DURATION
    eSTMalus.stackingRule = CONSTS.EFFECT_STACKING_RULE_UPDATE_DURATION
    eAtkMalus.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
    eSTMalus.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
    manager.applyEffectGroup([eAtkMalus, eSTMalus], 'SLA_DISTRACTION', target, duration, attacker)
}

module.exports = main
