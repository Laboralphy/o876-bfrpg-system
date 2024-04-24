const CONSTS = require('../../consts')

/**
 * This attack petrifies target
 * @param turn {number}
 * @param tick {number}
 * @param attackOutcome {BFAttackOutcome}
 * @param attacker {Creature}
 * @param target {Creature}
 * @param action {BFStoreStateAction}
 * @param script {string}
 * @param damage {string|number}
 * @param data {{}}
 * @param manager {{}}
 */
function main ({
    turn,
    tick,
    attackOutcome,
    attacker,
    target,
    action,
    script,
    damage,
    data,
    manager
}) {
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_PARALYSIS_PETRIFY).success) {
        const ePetrify = manager.effectProcessor.createEffect(CONSTS.EFFECT_PETRIFICATION)
        ePetrify.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
        manager.effectProcessor.applyEffect(ePetrify, target, Infinity, attacker)
    }
}

module.exports = main
