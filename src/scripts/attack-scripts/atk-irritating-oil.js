const CONSTS = require('../../consts')

/**
 * This attack covers target with an irritating oil, causing great suffer over 24 hours
 * Use adequate treatment to get rid of this ailment
 * @param turn {number}
 * @param tick {number}
 * @param attackOutcome {BFAttackOutcome}
 * @param attacker {Creature}
 * @param target {Creature}
 * @param action {BFStoreStateAction}
 * @param script {string}
 * @param damage {string|number}
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
                   manager
               }) {
    const eAtkMalus = manager.createEffect(CONSTS.EFFECT_ATTACK_MODIFIER, -2)
    eAtkMalus.stackingRule = CONSTS.EFFECT_STACKING_RULE_NO_STACK
    eAtkMalus.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
    manager.applyEffectGroup([eAtkMalus], 'SLA_IRRITATING_OIL', target, 10 * 60 * 24, attacker)
}

module.exports = main
