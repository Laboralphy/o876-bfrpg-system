const CONSTS = require('../../../../../consts')

/**
 * @description This attack covers target with an irritating oil.
 * The oil maybe get rid of but causes great suffer over 24 hours
 * Attack is lowered by 2. No saving throw allowed.
 * This attack is conveyed by a successful hit, so no saving throw
 * Use adequate treatment to get rid of this ailment (disease). Like remove diseases.
 *
 *
 *
 * @param oActionPayload {BFActionPayload}
 */
function main (oActionPayload) {
    const {
        attacker,
        target,
        manager
    } = oActionPayload
    const eAtkMalus = manager.createEffect(CONSTS.EFFECT_ATTACK_MODIFIER, -2)
    eAtkMalus.stackingRule = CONSTS.EFFECT_STACKING_RULE_NO_STACK
    eAtkMalus.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
    manager.applyEffectGroup([eAtkMalus], [CONSTS.EFFECT_TAG_DISEASE, 'SLA_IRRITATING_OIL'], target, manager.data['durations'].DURATION_DAY, attacker)
}

module.exports = main
