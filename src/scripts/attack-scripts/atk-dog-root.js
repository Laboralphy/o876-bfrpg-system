const CONSTS = require('../../consts')

/**
 * This attack is usually delivered by a dog or any beast that can grab target's leg.
 * the target cannot move or flee for 2 turns. The target still can attack or use tool/spells.
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
    data
}) {
    if (attackOutcome.hit) {
        const eRoot = manager.createEffect(CONSTS.EFFECT_SPEED_MODIFIER, -Infinity)
        eRoot.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
        eRoot.stackingRule = CONSTS.EFFECT_STACKING_RULE_UPDATE_DURATION
        manager.applyEffect(eRoot, target, 2, attacker)
    }
}

module.exports = main