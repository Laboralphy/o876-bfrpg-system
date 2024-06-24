const CONSTS = require('../../../consts')

/**
 * @description Apply a daze effect on target if saving throw against spell (mind spells) fails.
 * The dazed creature can't use attacks, spells or actions, but it can move and escape the place.
 * Parameters:
 * - duration (dice expression) duration of affliction
 * - potency (number) a modifier added to saving throw difficulty
 */
function main (oActionPayload) {
    const { attacker, target, manager, data } = oActionPayload
    const {
        duration = manager.data['durations'].DURATION_DEFAULT,
        potency = 0
    } = data
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_SPELL, {
        threat: CONSTS.THREAT_MIND_SPELL,
        adjustment: potency
    }).success) {
        const eDaze = manager.createEffect(CONSTS.EFFECT_DAZE)
        manager.applyEffect(eDaze, target, attacker.dice.evaluate(duration), attacker)
    }
}

module.exports = main