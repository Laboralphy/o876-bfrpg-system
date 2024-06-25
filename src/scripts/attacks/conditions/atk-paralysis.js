const CONSTS = require('../../../consts')

/**
 * @description Paralyzes target for a given duration, a saving throw against paralysis (with strength adjustment) is allowed to avoid the effect.
 * A paralyzed creature cannot move or act and may repeat its saving throw each turn to attempt to break the effect.
 * @var duration {Dice} (dice expression) duration of affliction
 * @var potency {number} a modifier added to saving throw difficulty
 *
 * @param oActionPayload {BFActionPayload}
 */
function main (oActionPayload) {
    const { attacker, target, manager, data } = oActionPayload
    const {
        duration = manager.data['durations'].DURATION_DEFAULT,
        potency = 0
    } = data
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_PARALYSIS_PETRIFY, {
        ability: CONSTS.ABILITY_STRENGTH,
        adjustment: potency
    }).success) {
        const eParalysis = manager.createEffect(CONSTS.EFFECT_PARALYSIS)
        eParalysis.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
        manager.applyEffect(eParalysis, target, attacker.dice.evaluate(duration), attacker)
    }
}

module.exports = main
