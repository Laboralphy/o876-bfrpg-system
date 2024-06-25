const CONSTS = require('../../../consts')

/**
 * @description This attack adds negative levels. The affliction can be avoided with a successfull saving throw against death
 * @var amount {Dice} level reduction value
 * @var duration {Dice} (dice expression) debuff duration once applied
 * @var potency {number} adjustment for saving throw (default 0). positive value = easier to resist, negative value = harder to resist
 *
 * @param oActionPayload {BFActionPayload}
 */
function main (oActionPayload) {
    const { attacker, target, manager, data } = oActionPayload
    const {
        amount,
        duration = manager.data['durations'].DURATION_DEFAULT,
        potency = 0
    } = data
    if (target.getters.getSpecie.living && !target.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON, {
        adjustment: potency
    }).success) {
        const eDrain = manager.createEffect(CONSTS.EFFECT_NEGATIVE_LEVEL, attacker.dice.evaluate(amount))
        eDrain.subtype = CONSTS.EFFECT_SUBTYPE_SUPERNATURAL
        manager.applyEffect(eDrain, target, attacker.dice.evaluate(duration), attacker)
    }
}

module.exports = main