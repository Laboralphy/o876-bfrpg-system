const CONSTS = require('../../../consts')

function evaluateDiseaseDuration (aStages) {
    return aStages
        .map(({ time, duration = 0 }) => time + duration)
        .reduce((prev, curr) => Math.max(prev, curr), 0)
}

/**
 * @description Apply a disease on target if saving throw against death ray fails.
 * An afflicted creature will suffer the corresponding disease.
 * @var disease {string} reference to disease
 * @var potency {number} a modifier added to saving throw difficulty
 * @var chance {number} probability to catch disease
 *
 * @param oActionPayload {BFActionPayload}
 */
function main (oActionPayload) {
    const { attacker, target, manager, data } = oActionPayload
    const {
        disease,
        chance = 100,
        potency = 0
    } = data
    // rolling chance
    if (target.dice.roll(100) > chance) {
        return
    }
    const oDiseaseDef = typeof disease === 'string'
        ? manager.data.disease[disease]
        : disease
    if (!oDiseaseDef) {
        throw new Error('unknown disease definition : ' + disease)
    }
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON, {
        adjustment: potency
    }).success) {
        const eDisease = manager.createEffect(CONSTS.EFFECT_DISEASE, 0, { disease: oDiseaseDef })
        eDisease.subtype = CONSTS.EFFECT_SUBTYPE_SUPERNATURAL
        manager.applyEffect(eDisease, target, evaluateDiseaseDuration(oDiseaseDef.stages) + 1, attacker)
    }
}

module.exports = main