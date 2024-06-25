const CONSTS = require('../../../consts')

/**
 * @description This attack damages an ability. A saving throw against death ray is allowed to negate the effect.
 * This attack affects living creature only.
 * The effect is supernatural : cannot be dispelled or removed by resting.
 * @var ability {string} (Ability) ability cursed
 * @var amount {number} ability reduction value
 * @var duration {Dice} (dice expression) debuff duration once applied
 * @var potency {number} adjustment for saving throw (default 0). positive value = easier to resist, negative value = harder to resist
 *
 * @param oActionPayload {BFActionPayload}
 */
function main (oActionPayload) {
    const { attacker, target, manager, data } = oActionPayload
    const {
        amount,
        ability,
        duration = manager.data['durations'].DURATION_DEFAULT,
        potency = 0
    } = data
    if (target.getters.getSpecie.living && !target.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON, {
        adjustment: potency
    }).success) {
        const eCurse = manager.createEffect(CONSTS.EFFECT_ABILITY_MODIFIER, amount, { ability })
        eCurse.subtype = CONSTS.EFFECT_SUBTYPE_SUPERNATURAL
        manager.applyEffect(eCurse, target, attacker.dice.evaluate(duration), attacker)
    }
}

module.exports = main