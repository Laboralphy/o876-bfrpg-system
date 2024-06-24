const CONSTS = require('../../../consts')

/**
 * @description This attack poisons target for an unlimited duration, dealing a small amount of damage each turn.
 * Parameters:
 * - duration (dice expression) duration of affliction
 * - potency (number) a modifier added to saving throw difficulty
 * - amount (dice expression)
 */
function main (oActionPayload) {
    const { attacker, target, manager, data } = oActionPayload
    const {
        duration = manager.data['durations'].DURATION_PERMANENT,
        potency = 0,
        amount
    } = data
    // if saving throw against poison fail then apply poison
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON, {
        adjustment: potency,
        threat: CONSTS.THREAT_POISON
    }).success) {
        const ePoison = manager.createEffect(CONSTS.EFFECT_DAMAGE, amount, {
            damageType: CONSTS.DAMAGE_TYPE_POISON
        })
        ePoison.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
        manager.applyEffect(ePoison, target, attacker.dice.evaluate(duration), attacker)
    }
}

module.exports = main