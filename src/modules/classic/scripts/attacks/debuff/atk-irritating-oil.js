const CONSTS = require('../../../../../consts')
const { durations: DURATIONS } = require('../../../../../data')

/**
 * Effect:
 * This attack covers target with an irritating oil.
 * The oil maybe get rid of but causes great suffer over 24 hours
 * Attack is lowered by 2.
 *
 * Saving throw:
 * None
 *
 * Data:
 * None
 *
 * Note:
 * This attack is conveyed by a successful hit, so no saving throw
 * Use adequate treatment to get rid of this ailment (disease). Like remove diseases.
 *
 *
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
    manager.applyEffectGroup([eAtkMalus], [CONSTS.EFFECT_TAG_DISEASE, 'SLA_IRRITATING_OIL'], target, DURATIONS.DURATION_DAY, attacker)
}

module.exports = main
