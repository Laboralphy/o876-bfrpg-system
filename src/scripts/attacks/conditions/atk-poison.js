const CONSTS = require('../../../consts')

/**
 * @description This attack poisons target for an unlimited duration, dealing a small amount of damage each turn.
 * @var duration {integer} duration of affliction
 * @var potency {number} a modifier added to saving throw difficulty
 *
 * @param oActionPayload {BFActionPayload}
 */
function main (oActionPayload) {
    const { attacker, target, damage, manager, data } = oActionPayload
    const {
        duration = manager.data['durations'].DURATION_PERMANENT,
        potency = 0
    } = data
    // if saving throw against poison fail then apply poison
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON, {
        adjustment: potency
    }).success) {
        const ePoison = manager.createEffect(CONSTS.EFFECT_DAMAGE, damage, {
            damageType: CONSTS.DAMAGE_TYPE_POISON
        })
        ePoison.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
        manager.applyEffect(ePoison, target, duration, attacker)
    }
}

module.exports = main