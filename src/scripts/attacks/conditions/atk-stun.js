const CONSTS = require('../../../consts')

/**
 * @description Apply a stun effect on target. A stunned creature is unable to do anything. It is pretty much like
 * a paralysis effect except for two aspects : 1) the saving throw is against death ray instead of paralysis.
 * 2) the paralyzed creature cannot roll a saving throw each turn to attempt breaking free.
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
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON, {
        adjustment: potency
    }).success) {
        const eStun = manager.createEffect(CONSTS.EFFECT_STUN)
        eStun.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
        manager.applyEffect(eStun, target, attacker.dice.evaluate(duration), attacker)
    }
}

module.exports = main
