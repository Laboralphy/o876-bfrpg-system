const CONSTS = require('../../../consts')

/**
 * @description Apply blindness on target. If saving throw against death ray is success, the effect is avoided.
 * A blinded creature cannot clearly see its surroundings and have attack and ac debuffs.
 * @var duration {Dice} (dice expression) duration of affliction
 * @var potency {number} a modifier added to saving throw difficulty
 *
 * @param oActionPayload {BFActionPayload}
 */
function main (oActionPayload) {
    const { manager, target, attacker, data } = oActionPayload
    const {
        duration = manager.data['durations'].DURATION_DEFAULT,
        potency = 0
    } = data
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON, { adjustment: potency }).success) {
        const eBlindness = manager.createEffect(CONSTS.EFFECT_BLINDNESS)
        eBlindness.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
        manager.applyEffect(eBlindness, target, attacker.dice.evaluate(duration), attacker)
    }
}

module.exports = main
