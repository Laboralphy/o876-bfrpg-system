const CONSTS = require('../../../../../consts')

/**
 * @description This attack lowers attack bonus, and saving throw bonus by 2. There is no saving throw allowed for this attack
 * The affliction cannot be stacked : several sources of distraction will not stack.
 * @var duration {integer}
 *
 * @param oActionPayload {BFActionPayload}
 */
function main (oActionPayload) {
    const {
        attacker, target, manager, data
    } = oActionPayload
    const {
        duration = manager.data['durations'].DURATION_DEFAULT
    } = data
    const eAtkMalus = manager.createEffect(CONSTS.EFFECT_ATTACK_MODIFIER, -2)
    const eSTMalus = manager.createEffect(CONSTS.EFFECT_SAVING_THROW_MODIFIER, -2)
    eAtkMalus.stackingRule = CONSTS.EFFECT_STACKING_RULE_UPDATE_DURATION
    eSTMalus.stackingRule = CONSTS.EFFECT_STACKING_RULE_UPDATE_DURATION
    eAtkMalus.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
    eSTMalus.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
    manager.applyEffectGroup([eAtkMalus, eSTMalus], 'SLA_DISTRACTION', target, duration, attacker)
}

module.exports = main
