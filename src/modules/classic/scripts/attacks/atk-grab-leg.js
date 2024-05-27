const CONSTS = require('../../../../consts')

/**
 * Effect:
 * Apply a root effect on target : the target may not be able to move, but still can attack and cast spells.
 * The duration is fixed at 2 turns. Because it is usually an attack delivered by a creature that can grab legs
 * like a dog or a beast.
 *
 * Saving throw:
 * None
 *
 * Data:
 * None
 *
 * Note:
 * This attack is usually delivered by a dog or any beast that can grab target's leg.
 *
 *
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
    const eRoot = manager.createEffect(CONSTS.EFFECT_SPEED_MODIFIER, 0)
    eRoot.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
    eRoot.stackingRule = CONSTS.EFFECT_STACKING_RULE_UPDATE_DURATION
    manager.applyEffect(eRoot, target, 2, attacker)
}

module.exports = main