const CONSTS = require('../../../../consts')

/**
 * @description Apply a root effect on target : the target may not be able to move, but still can attack and cast spells.
 * The duration is fixed at 2 turns. Because it is usually an attack delivered by a creature that can grab legs
 * like a dog or a beast. No saving throw allowed
 * This attack is usually delivered by a dog or any beast that can grab target's leg.
 *
 * @param oActionPayload {BFActionPayload}
 */
function main (oActionPayload) {
    const { manager, attacker, target } = oActionPayload
    const eRoot = manager.createEffect(CONSTS.EFFECT_SPEED_FACTOR, 0)
    eRoot.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
    eRoot.stackingRule = CONSTS.EFFECT_STACKING_RULE_UPDATE_DURATION
    manager.applyEffect(eRoot, target, 2, attacker)
}

module.exports = main