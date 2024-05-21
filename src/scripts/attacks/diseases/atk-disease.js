const CONSTS = require('../../../consts')

function evaluateDiseaseDuration (aStages) {
    return aStages
        .map(({ time, duration = 0 }) => time + duration)
        .reduce((prev, curr) => Math.max(prev, curr), 0)
}

/**
 * Attack script
 * @param turn {number}
 * @param tick {number}
 * @param attackOutcome {BFAttackOutcome}
 * @param attacker {Creature}
 * @param target {Creature}
 * @param action {BFStoreStateAction}
 * @param script {string}
 * @param damage {string|number}
 * @param manager {{}}
 * @param disease {string|object}
 */
function main ({
    turn,
    tick,
    attacker,
    target,
    attackOutcome,
    script,
    action,
    manager,
    data: {
        disease,
        chance = 100,
        potency = 0
    },
}) {
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