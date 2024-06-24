const CONSTS = require('../../../consts')
const { durations: DURATIONS } = require('../../../data')

/**
 * @description This attack petrifies target. This is a permanent effect.
 * A saving throw against paralysis is allowed to avoid the effect.
 * @var potency {number} a modifier added to saving throw difficulty
 */
function main (oActionPayload) {
    const { attacker, target, manager, data } = oActionPayload
    const {
        potency = 0
    } = data
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_PARALYSIS_PETRIFY, {
        adjustment: potency
    }).success) {
        const ePetrify = manager.createEffect(CONSTS.EFFECT_PETRIFICATION)
        ePetrify.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
        manager.applyEffect(ePetrify, target, DURATIONS.DURATION_PERMANENT, attacker)
    }
}

module.exports = main
