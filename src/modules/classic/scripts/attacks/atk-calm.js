const CONSTS = require('../../../../consts')

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
 * @param data {{}}
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
    manager,
    data: {
        duration = CONSTS.DURATION_DEFAULT
    }
}) {
    if (!target.rollSavingThrow(CONSTS.SAVING_THROW_SPELL, { threat: CONSTS.THREAT_MIND_SPELL }).success) {
        const eCalm = manager.createEffect(CONSTS.EFFECT_CALM)
        manager.applyEffect(eCalm, target, duration, attacker)
    }
}

module.exports = main