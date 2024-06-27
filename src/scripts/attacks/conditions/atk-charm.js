const CONSTS = require('../../../consts')

/**
 * @description Apply charm on target. If saving throw against spell is success, the effect is avoided.
 * The charmed creature will not be able to attack its charmer and may react aggressively against its charmer's opponents.
 * @var duration {integer} duration of affliction
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
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_SPELL, {
        threat: CONSTS.THREAT_MIND_SPELL,
        adjustment: potency
    }).success) {
        const eCharm = manager.createEffect(CONSTS.EFFECT_CHARM)
        manager.applyEffect(eCharm, target, duration, attacker)
    }
}

module.exports = main